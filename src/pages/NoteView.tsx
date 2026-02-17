import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '@/contexts/NotesContext';
import { ArrowLeft, Trash2, Pencil, X, Plus, Check } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { getTagStyle } from '@/lib/tagColor';

const NoteView = () => {
  const { id } = useParams<{ id: string }>();
  const {
    getNoteById,
    getLibraryById,
    getChildLibraries,
    getLibraryDepth,
    updateNote,
    deleteNote,
    addLibrary,
    tags,
  } = useNotes();
  const navigate = useNavigate();

  const note = id ? getNoteById(id) : undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
  const [newLibraryName, setNewLibraryName] = useState('');
  const [showNewLibrary, setShowNewLibrary] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setSelectedTags(note.tags || []);
      setSelectedLibrary(note.libraryId);
    }
  }, [note?.id, note?.title, note?.content, note?.tags, note?.libraryId]);

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

  const handleCreateLibrary = async () => {
    const name = newLibraryName.trim();
    if (name) {
      const lib = await addLibrary(name, selectedLibrary);
      setSelectedLibrary(lib.id);
      setNewLibraryName('');
      setShowNewLibrary(false);
    }
  };

  const handleSave = async () => {
    if (!note) return;
    setSaving(true);
    try {
      await updateNote(note.id, {
        title: title.trim() || 'Untitled',
        content: content.trim(),
        tags: selectedTags,
        libraryId: selectedLibrary,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setSelectedTags(note.tags || []);
      setSelectedLibrary(note.libraryId);
    }
    setIsEditing(false);
  };

  if (!note) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Note not found</p>
        </div>
      </PageTransition>
    );
  }

  const library = note.libraryId ? getLibraryById(note.libraryId) : null;
  const date = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const handleDelete = async () => {
    await deleteNote(note.id);
    navigate(-1);
  };

  const selectedPath = getSelectedPath();
  const currentChildren = getChildLibraries(selectedLibrary);
  const canCreateSub = !selectedLibrary || getLibraryDepth(selectedLibrary) < 4;

  return (
    <PageTransition>
      <div className="min-h-screen max-w-lg mx-auto">
        <div className="sticky top-0 z-10 glass-surface bg-background/90 px-4 py-3 flex items-center justify-between border-b border-border">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 active:opacity-60">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button onClick={handleCancelEdit} className="p-1.5 active:opacity-60" aria-label="Cancel">
                  <X size={20} className="text-foreground" />
                </button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary text-primary-foreground text-[13px] font-semibold px-4 py-1.5 rounded-full active:opacity-80 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save'}
                </motion.button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="p-1.5 active:opacity-60" aria-label="Edit note">
                  <Pencil size={20} className="text-foreground" />
                </button>
                <button onClick={handleDelete} className="p-1 -mr-1 active:opacity-60" aria-label="Delete">
                  <Trash2 size={20} className="text-destructive" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="px-5 pt-6 pb-12">
          {isEditing ? (
            <div className="space-y-6">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-[22px] font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-foreground"
                autoFocus
              />
              <textarea
                placeholder="Start writing..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full min-h-[200px] text-[15px] leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40 text-foreground"
              />

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

              <div>
                <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Library (move note)</h3>
                {selectedPath.length > 0 && (
                  <div className="flex items-center gap-1 mb-3 overflow-x-auto text-[12px]">
                    <button onClick={() => setSelectedLibrary(null)} className="text-muted-foreground whitespace-nowrap">
                      Root
                    </button>
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
                        placeholder={selectedLibrary ? 'Sub-library name...' : 'Library name...'}
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
          ) : (
            <>
              <h1 className="text-[24px] font-bold text-foreground leading-tight mb-2">
                {note.title || 'Untitled'}
              </h1>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[12px] text-text-tertiary">{date}</span>
                {library && (
                  <>
                    <span className="text-text-tertiary">·</span>
                    <span className="text-[12px] text-text-tertiary">{library.name}</span>
                  </>
                )}
              </div>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {note.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full text-[12px] font-medium" style={getTagStyle(tag)}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
                {note.content}
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default NoteView;
