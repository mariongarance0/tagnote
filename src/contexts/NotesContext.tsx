import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  createdAt: number;
}

interface NotesState {
  notes: Note[];
  libraries: Library[];
  tags: string[];
}

interface NotesContextType extends NotesState {
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (id: string) => void;
  addLibrary: (name: string) => Library;
  deleteLibrary: (id: string) => void;
  addTag: (tag: string) => void;
  deleteTag: (tag: string) => void;
  getNotesForLibrary: (libraryId: string) => Note[];
  getNotesForTags: (tags: string[]) => Note[];
  getNoteById: (id: string) => Note | undefined;
  getLibraryById: (id: string) => Library | undefined;
}

const NotesContext = createContext<NotesContextType | null>(null);

const STORAGE_KEY = 'tagnote-data';

const loadState = (): NotesState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { notes: [], libraries: [], tags: [] };
};

const saveState = (state: NotesState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const genId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NotesState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newNote: Note = { ...note, id: genId(), createdAt: now, updatedAt: now };
    setState(s => {
      const newTags = note.tags.filter(t => !s.tags.includes(t));
      return { ...s, notes: [newNote, ...s.notes], tags: [...s.tags, ...newTags] };
    });
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setState(s => ({
      ...s,
      notes: s.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState(s => ({ ...s, notes: s.notes.filter(n => n.id !== id) }));
  }, []);

  const addLibrary = useCallback((name: string) => {
    const lib: Library = { id: genId(), name, createdAt: Date.now() };
    setState(s => ({ ...s, libraries: [...s.libraries, lib] }));
    return lib;
  }, []);

  const deleteLibrary = useCallback((id: string) => {
    setState(s => ({
      ...s,
      libraries: s.libraries.filter(l => l.id !== id),
      notes: s.notes.map(n => n.libraryId === id ? { ...n, libraryId: null } : n),
    }));
  }, []);

  const addTag = useCallback((tag: string) => {
    setState(s => s.tags.includes(tag) ? s : { ...s, tags: [...s.tags, tag] });
  }, []);

  const deleteTag = useCallback((tag: string) => {
    setState(s => ({
      ...s,
      tags: s.tags.filter(t => t !== tag),
      notes: s.notes.map(n => ({ ...n, tags: n.tags.filter(t => t !== tag) })),
    }));
  }, []);

  const getNotesForLibrary = useCallback((libraryId: string) => {
    return state.notes.filter(n => n.libraryId === libraryId);
  }, [state.notes]);

  const getNotesForTags = useCallback((tags: string[]) => {
    if (tags.length === 0) return state.notes;
    return state.notes.filter(n => tags.some(t => n.tags.includes(t)));
  }, [state.notes]);

  const getNoteById = useCallback((id: string) => state.notes.find(n => n.id === id), [state.notes]);
  const getLibraryById = useCallback((id: string) => state.libraries.find(l => l.id === id), [state.libraries]);

  return (
    <NotesContext.Provider value={{
      ...state, addNote, updateNote, deleteNote, addLibrary, deleteLibrary,
      addTag, deleteTag, getNotesForLibrary, getNotesForTags, getNoteById, getLibraryById,
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
