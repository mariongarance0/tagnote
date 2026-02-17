import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  libraryId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Library {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
}

interface NotesState {
  notes: Note[];
  libraries: Library[];
  tags: string[];
  loading: boolean;
}

interface NotesContextType extends NotesState {
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addLibrary: (name: string, parentId?: string | null) => Promise<Library>;
  deleteLibrary: (id: string) => Promise<void>;
  addTag: (tag: string) => void;
  deleteTag: (tag: string) => void;
  getNotesForLibrary: (libraryId: string) => Note[];
  getChildLibraries: (parentId: string | null) => Library[];
  getLibraryDepth: (libraryId: string) => number;
  getNotesForTags: (tags: string[]) => Note[];
  getNoteById: (id: string) => Note | undefined;
  getLibraryById: (id: string) => Library | undefined;
  getLibraryPath: (libraryId: string) => Library[];
}

const NotesContext = createContext<NotesContextType | null>(null);

const mapNote = (row: any): Note => ({
  id: row.id,
  title: row.title,
  content: row.content,
  tags: row.tags || [],
  libraryId: row.library_id,
  createdAt: new Date(row.created_at).getTime(),
  updatedAt: new Date(row.updated_at).getTime(),
});

const mapLibrary = (row: any): Library => ({
  id: row.id,
  name: row.name,
  parentId: row.parent_id,
  createdAt: new Date(row.created_at).getTime(),
});

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive tags from notes
  const deriveTags = useCallback((notesList: Note[]) => {
    const allTags = new Set<string>();
    notesList.forEach(n => n.tags.forEach(t => allTags.add(t)));
    setTags(Array.from(allTags));
  }, []);

  // Fetch data on user change
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLibraries([]);
      setTags([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const [notesRes, libsRes] = await Promise.all([
        supabase.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
        supabase.from('libraries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      const fetchedNotes = (notesRes.data || []).map(mapNote);
      setNotes(fetchedNotes);
      setLibraries((libsRes.data || []).map(mapLibrary));
      deriveTags(fetchedNotes);
      setLoading(false);
    };

    fetchData();
  }, [user, deriveTags]);

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase.from('notes').insert({
      user_id: user!.id,
      title: note.title,
      content: note.content,
      tags: note.tags,
      library_id: note.libraryId,
    }).select().single();

    if (error) throw error;
    const newNote = mapNote(data);
    setNotes(prev => {
      const updated = [newNote, ...prev];
      deriveTags(updated);
      return updated;
    });
    return newNote;
  }, [user, deriveTags]);

  const updateNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.libraryId !== undefined) dbUpdates.library_id = updates.libraryId;

    const { data, error } = await supabase.from('notes').update(dbUpdates).eq('id', id).select().single();
    if (error) throw error;

    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? mapNote(data) : n);
      deriveTags(updated);
      return updated;
    });
  }, [deriveTags]);

  const deleteNote = useCallback(async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      deriveTags(updated);
      return updated;
    });
  }, [deriveTags]);

  const addLibrary = useCallback(async (name: string, parentId?: string | null) => {
    const { data, error } = await supabase.from('libraries').insert({
      user_id: user!.id,
      name,
      parent_id: parentId || null,
    }).select().single();
    if (error) throw error;
    const lib = mapLibrary(data);
    setLibraries(prev => [...prev, lib]);
    return lib;
  }, [user]);

  const deleteLibrary = useCallback(async (id: string) => {
    const { error } = await supabase.from('libraries').delete().eq('id', id);
    if (error) throw error;
    setLibraries(prev => prev.filter(l => l.id !== id));
    // Notes with this library_id will be set to null by DB cascade
    setNotes(prev => prev.map(n => n.libraryId === id ? { ...n, libraryId: null } : n));
  }, []);

  const addTag = useCallback((tag: string) => {
    setTags(prev => prev.includes(tag) ? prev : [...prev, tag]);
  }, []);

  const deleteTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    // Remove tag from all notes in DB
    notes.filter(n => n.tags.includes(tag)).forEach(n => {
      const newTags = n.tags.filter(t => t !== tag);
      supabase.from('notes').update({ tags: newTags }).eq('id', n.id);
    });
    setNotes(prev => prev.map(n => ({ ...n, tags: n.tags.filter(t => t !== tag) })));
  }, [notes]);

  const getNotesForLibrary = useCallback((libraryId: string) => {
    return notes.filter(n => n.libraryId === libraryId);
  }, [notes]);

  const getChildLibraries = useCallback((parentId: string | null) => {
    return libraries.filter(l => l.parentId === parentId);
  }, [libraries]);

  const getLibraryDepth = useCallback((libraryId: string) => {
    let depth = 1;
    let current = libraries.find(l => l.id === libraryId);
    while (current?.parentId) {
      depth++;
      current = libraries.find(l => l.id === current!.parentId);
    }
    return depth;
  }, [libraries]);

  const getLibraryPath = useCallback((libraryId: string) => {
    const path: Library[] = [];
    let current = libraries.find(l => l.id === libraryId);
    while (current) {
      path.unshift(current);
      current = current.parentId ? libraries.find(l => l.id === current!.parentId) : undefined;
    }
    return path;
  }, [libraries]);

  const getNotesForTags = useCallback((selectedTags: string[]) => {
    if (selectedTags.length === 0) return notes;
    return notes.filter(n => selectedTags.some(t => n.tags.includes(t)));
  }, [notes]);

  const getNoteById = useCallback((id: string) => notes.find(n => n.id === id), [notes]);
  const getLibraryById = useCallback((id: string) => libraries.find(l => l.id === id), [libraries]);

  return (
    <NotesContext.Provider value={{
      notes, libraries, tags, loading,
      addNote, updateNote, deleteNote, addLibrary, deleteLibrary,
      addTag, deleteTag, getNotesForLibrary, getChildLibraries, getLibraryDepth, getNotesForTags, getNoteById, getLibraryById, getLibraryPath,
    }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
};
