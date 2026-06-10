import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '@/contexts/NotesContext';
import { ArrowLeft, Plus, Check, ChevronRight, BookOpen, FolderOpen, Trash2, Move } from 'lucide-react';
import NoteCard from '@/components/NoteCard';
import PageTransition from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import MoveLibraryDialog from '@/components/MoveLibraryDialog';

const LibraryView = () => {
  const { id } = useParams<{ id: string }>();
  const { getLibraryById, getNotesForLibrary, getChildLibraries, getLibraryDepth, getLibraryPath, addLibrary, deleteLibrary } = useNotes();
  const navigate = useNavigate();

  const [showNewSub, setShowNewSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showMove, setShowMove] = useState(false);

  const library = id ? getLibraryById(id) : undefined;
  const notes = id ? getNotesForLibrary(id) : [];
  const children = id ? getChildLibraries(id) : [];
  const depth = id ? getLibraryDepth(id) : 0;
  const breadcrumbs = id ? getLibraryPath(id) : [];

  if (!library) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Library not found</p>
        </div>
      </PageTransition>
    );
  }

  const canAddSubLibrary = depth < 4;

  const handleCreateSub = async () => {
    const name = newSubName.trim();
    if (name && id) {
      await addLibrary(name, id);
      setNewSubName('');
      setShowNewSub(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen max-w-lg mx-auto safe-bottom">
        <div className="sticky top-0 z-10 glass-surface bg-background/90 px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 active:opacity-60">
              <ArrowLeft size={22} className="text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-semibold text-foreground truncate">{library.name}</h2>
              <p className="text-[11px] text-muted-foreground">
                {notes.length} note{notes.length !== 1 ? 's' : ''}
                {children.length > 0 && ` · ${children.length} sub-librar${children.length !== 1 ? 'ies' : 'y'}`}
              </p>
            </div>
            <button onClick={() => setShowMove(true)} className="p-1.5 rounded-lg active:opacity-60 text-muted-foreground hover:text-foreground transition-colors" title="Move library">
              <Move size={18} />
            </button>
            <button onClick={() => setConfirmDelete(true)} className="p-1.5 rounded-lg active:opacity-60 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <div className="flex items-center gap-1 mt-1.5 overflow-x-auto text-[11px]">
              {breadcrumbs.map((bc, i) => (
                <span key={bc.id} className="flex items-center gap-1 whitespace-nowrap">
                  {i > 0 && <ChevronRight size={10} className="text-muted-foreground" />}
                  <button
                    onClick={() => navigate(`/library/${bc.id}`)}
                    className={`${i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                  >
                    {bc.name}
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 pt-4 pb-6">
          {/* Sub-libraries */}
          {children.length > 0 && (
            <div className="mb-4">
              <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sub-libraries</h3>
              <div className="flex flex-col gap-2">
                {children.map((child, i) => {
                  const childNotes = getNotesForLibrary(child.id).length;
                  const childSubs = getChildLibraries(child.id).length;
                  return (
                    <motion.button
                      key={child.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => navigate(`/library/${child.id}`)}
                      className="w-full flex items-center justify-between bg-card rounded-2xl px-4 py-3 shadow-card active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                          {childSubs > 0 ? <FolderOpen size={16} className="text-foreground" /> : <BookOpen size={16} className="text-foreground" />}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-[14px] text-foreground">{child.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {childNotes} note{childNotes !== 1 ? 's' : ''}
                            {childSubs > 0 && ` · ${childSubs} sub`}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add sub-library button */}
          {canAddSubLibrary && (
            <div className="mb-4">
              {!showNewSub ? (
                <button
                  onClick={() => setShowNewSub(true)}
                  className="flex items-center gap-2 text-[13px] text-muted-foreground active:opacity-60"
                >
                  <Plus size={14} /> Add sub-library
                </button>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex gap-2 overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Sub-library name..."
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreateSub()}
                      className="flex-1 text-[14px] px-3.5 py-2 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground/50 border-none outline-none"
                      autoFocus
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCreateSub}
                      className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center"
                    >
                      <Check size={16} className="text-primary-foreground" />
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          )}

          {/* Notes */}
          {notes.length === 0 && children.length === 0 ? (
            <p className="text-center text-muted-foreground text-[15px] mt-16">No notes or sub-libraries yet</p>
          ) : notes.length > 0 ? (
            <div>
              {children.length > 0 && (
                <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
              )}
              <div className="flex flex-col gap-2.5">
                {notes.map((note, i) => (
                  <NoteCard key={note.id} note={note} index={i} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{library.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this library and all notes inside it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => { await deleteLibrary(id!); navigate(-1); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete library
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {id && (
        <MoveLibraryDialog
          open={showMove}
          onOpenChange={setShowMove}
          libraryId={id}
          onMoved={() => navigate(-1)}
        />
      )}
    </PageTransition>
  );
};

export default LibraryView;
