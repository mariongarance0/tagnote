import { useState } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus, Check } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Build the breadcrumb path for the selected library
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

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    await addNote({
      title: title.trim() || 'Untitled',
      content: content.trim(),
      tags: selectedTags,
      libraryId: selectedLibrary,
    });
    navigate(-1);
  };

  return (
    <PageTransition>
      <div className="min-h-screen max-w-lg mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 glass-surface bg-background/90 px-4 py-3 flex items-center justify-between border-b border-border">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 active:opacity-60">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <h2 className="text-[15px] font-semibold text-foreground">New Note</h2>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSave}
            className="bg-primary text-primary-foreground text-[13px] font-semibold px-4 py-1.5 rounded-full active:opacity-80"
          >
            Save
          </motion.button>
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

            {/* Selected Tags */}
            <AnimatePresence>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map(tag => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[13px] font-medium"
                    >
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-0.5">
                        <X size={12} />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Existing Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.filter(t => !selectedTags.includes(t)).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleExistingTag(tag)}
                    className="px-3 py-1 rounded-full bg-tag-bg text-tag-foreground text-[13px] font-medium active:scale-95 transition-transform"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* New Tag Input */}
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

            {/* Breadcrumb path */}
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
              {/* Go up / None button */}
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

              {/* Show children of the currently selected library (or root) */}
              {currentChildren.map(lib => (
                <button
                  key={lib.id}
                  onClick={() => setSelectedLibrary(lib.id)}
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-tag-bg text-tag-foreground"
                >
                  {lib.name}
                </button>
              ))}

              {/* If no library selected, also show root libraries */}
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
