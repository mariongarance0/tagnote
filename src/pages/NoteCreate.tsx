import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus, Check, Cloud, CloudOff } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { getTagStyle } from '@/lib/tagColor';
import { isOnline } from '@/lib/offlineStorage';

const NoteCreate = () => {
  const { addNote, libraries, tags, addLibrary, getChildLibraries, getLibraryById, getLibraryDepth } = useNotes();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
  const [newLibraryName, setNewLibraryName] = useState('');
  const [showNewLibrary, setShowNewLibrary] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'offline'>('idle');
  const savedNoteIdRef = useRef<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save: create or update after debounce
  const autoSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;

    setSaveStatus('saving');
    try {
      if (!savedNoteIdRef.current) {
        // First save — create
        const note = await addNote({
          title: title.trim() || 'Untitled',
          content: content.trim(),
          tags: selectedTags,
          libraryId: selectedLibrary,
        });
        savedNoteIdRef.current = note.id;
      } else {
        // Update existing
        const { updateNote } = useNotesRef.current;
        await updateNote(savedNoteIdRef.current, {
          title: title.trim() || 'Untitled',
          content: content.trim(),
          tags: selectedTags,
          libraryId: selectedLibrary,
        });
      }
      setSaveStatus(isOnline() ? 'saved' : 'offline');
      setSaved(true);
    } catch {
      setSaveStatus('idle');
    }
  }, [title, content, selectedTags, selectedLibrary, addNote]);

  // We need updateNote via a ref to avoid circular deps
  const { updateNote } = useNotes();
  const useNotesRef = useRef({ updateNote });
  useEffect(() => { useNotesRef.current = { updateNote }; }, [updateNote]);

  // Trigger debounced auto-save on content changes
  useEffect(() => {
    if (!title.trim() && !content.trim()) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setSaveStatus('idle');
    autoSaveTimerRef.current = setTimeout(() => { autoSave(); }, 1500);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [title, content, selectedTags, selectedLibrary, autoSave]);

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const toggleExistingTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCreateLibrary = async () => {
    const name = newLibraryName.trim();
    if (name) {
      const parentId = selectedLibrary;
      const lib = await addLibrary(name, parentId);
      setSelectedLibrary(lib.id);
      setNewLibraryName('');
      setShowNewLibrary(false);
    }
  };

  const getSelectedPath = () => {
    if (!selectedLibrary) return [];
    const path: { id: string; name: string }[] = [];
    let current = getLibraryById(selectedLibrary);
    while (current) {
      path.unshift(current);
      current = current.parentId ? getLibraryById(current.parentId) : undefined;
    }
    return path;
  };

  const selectedPath = getSelectedPath();
  const currentChildren = getChildLibraries(selectedLibrary);
  const canCreateSub = !selectedLibrary || getLibraryDepth(selectedLibrary) < 4;

  const handleBack = () => {
    // Force save before leaving if needed
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSave();
    }
    navigate(-1);
  };

  return (
    <PageTransition>
      <div className="min-h-screen max-w-lg mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 glass-surface bg-background/90 px-4 py-3 flex items-center justify-between border-b border-border">
          <button onClick={handleBack} className="p-1 -ml-1 active:opacity-60">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <h2 className="text-[15px] font-semibold text-foreground">New Note</h2>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {saveStatus === 'saving' && (
              <span className="text-[12px] text-muted-foreground animate-pulse">Saving…</span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[12px] text-primary">
                <Cloud size={14} /> Saved
              </span>
            )}
            {saveStatus === 'offline' && (
              <span className="flex items-center gap-1 text-[12px] text-amber-500">
                <CloudOff size={14} /> Offline
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pt-5 pb-12 space-y-6">
          {/* Title */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-[22px] font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-foreground"
            autoFocus
          />

          {/* Content */}
          <textarea
            placeholder="Start writing..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full min-h-[200px] text-[15px] leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40 text-foreground"
          />

          {/* Tags Section */}
          <div>
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tags</h3>
            <AnimatePresence>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map(tag => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-medium"
                      style={getTagStyle(tag)}
                    >
                      <span className="opacity-90">{tag}</span>
                      <button onClick={() => handleRemoveTag(tag)} className="ml-0.5 opacity-80 hover:opacity-100">
                        <X size={12} />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </AnimatePresence>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.filter(t => !selectedTags.includes(t)).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleExistingTag(tag)}
                    className="px-3 py-1 rounded-full text-[13px] font-medium active:scale-95 transition-transform"
                    style={getTagStyle(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag..."
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                className="flex-1 text-[14px] px-3.5 py-2 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground/50 border-none outline-none"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAddTag}
                className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:opacity-70"
              >
                <Plus size={18} className="text-foreground" />
              </motion.button>
            </div>
          </div>

          {/* Library Section */}
          <div>
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Library</h3>
            {selectedPath.length > 0 && (
              <div className="flex items-center gap-1 mb-3 overflow-x-auto text-[12px]">
                <button onClick={() => setSelectedLibrary(null)} className="text-muted-foreground whitespace-nowrap">Root</button>
                {selectedPath.map(bc => (
                  <span key={bc.id} className="flex items-center gap-1 whitespace-nowrap">
                    <span className="text-muted-foreground">/</span>
                    <button
                      onClick={() => setSelectedLibrary(bc.id)}
                      className={bc.id === selectedLibrary ? 'text-foreground font-medium' : 'text-muted-foreground'}
                    >
                      {bc.name}
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedLibrary ? (
                <button
                  onClick={() => {
                    const current = getLibraryById(selectedLibrary);
                    setSelectedLibrary(current?.parentId ?? null);
                  }}
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-tag-bg text-tag-foreground"
                >
                  ← Up
                </button>
              ) : (
                <button
                  onClick={() => setSelectedLibrary(null)}
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-primary text-primary-foreground"
                >
                  None
                </button>
              )}
              {currentChildren.map(lib => (
                <button
                  key={lib.id}
                  onClick={() => setSelectedLibrary(lib.id)}
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-tag-bg text-tag-foreground"
                >
                  {lib.name}
                </button>
              ))}
              {!selectedLibrary && getChildLibraries(null).map(lib => (
                <button
                  key={lib.id}
                  onClick={() => setSelectedLibrary(lib.id)}
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-tag-bg text-tag-foreground"
                >
                  {lib.name}
                </button>
              ))}
              {canCreateSub && (
                <button
                  onClick={() => setShowNewLibrary(true)}
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-tag-bg text-tag-foreground flex items-center gap-1"
                >
                  <Plus size={14} /> New
                </button>
              )}
            </div>
            <AnimatePresence>
              {showNewLibrary && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-2 overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder={selectedLibrary ? "Sub-library name..." : "Library name..."}
                    value={newLibraryName}
                    onChange={e => setNewLibraryName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateLibrary()}
                    className="flex-1 text-[14px] px-3.5 py-2 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground/50 border-none outline-none"
                    autoFocus
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCreateLibrary}
                    className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center"
                  >
                    <Check size={16} className="text-primary-foreground" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default NoteCreate;
