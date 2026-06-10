import { useNotes } from '@/contexts/NotesContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FolderOpen, Trash2, Move } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
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

const Libraries = () => {
  const { getChildLibraries, getNotesForLibrary, deleteLibrary } = useNotes();
  const navigate = useNavigate();
  const [libToDelete, setLibToDelete] = useState<string | null>(null);
  const [libToMove, setLibToMove] = useState<string | null>(null);

  // Only show root-level libraries
  const rootLibraries = getChildLibraries(null);

  return (
    <PageTransition>
      <div className="safe-bottom px-5 pt-14 pb-6 max-w-lg mx-auto">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground mb-1">Libraries</h1>
        <p className="text-muted-foreground text-[15px] mb-8">
          {rootLibraries.length} {rootLibraries.length === 1 ? 'library' : 'libraries'}
        </p>

        {rootLibraries.length === 0 ? (
          <div className="text-center mt-16">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-[15px]">Create a library when adding a note</p>
          </div>
        ) : (
          <>
          <div className="flex flex-col gap-2">
            {rootLibraries.map((lib, i) => {
              const noteCount = getNotesForLibrary(lib.id).length;
              const subCount = getChildLibraries(lib.id).length;
              return (
                <motion.div
                  key={lib.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="w-full flex items-center bg-card rounded-2xl px-4 py-3.5 shadow-card"
                >
                  <button
                    onClick={() => navigate(`/library/${lib.id}`)}
                    className="flex-1 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                      {subCount > 0 ? (
                        <FolderOpen size={18} className="text-foreground" />
                      ) : (
                        <BookOpen size={18} className="text-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[15px] text-foreground">{lib.name}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {noteCount} note{noteCount !== 1 ? 's' : ''}
                        {subCount > 0 && ` · ${subCount} sub-librar${subCount !== 1 ? 'ies' : 'y'}`}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => setLibToMove(lib.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground active:opacity-60 transition-colors"
                    title="Move library"
                  >
                    <Move size={17} />
                  </button>
                  <button
                    onClick={() => setLibToDelete(lib.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive active:opacity-60 transition-colors"
                  >
                    <Trash2 size={17} />
                  </button>
                </motion.div>
              );
            })}
          </div>

          <AlertDialog open={!!libToDelete} onOpenChange={open => !open && setLibToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{rootLibraries.find(l => l.id === libToDelete)?.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this library and all notes inside it. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => { if (libToDelete) { await deleteLibrary(libToDelete); setLibToDelete(null); } }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete library
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {libToMove && (
            <MoveLibraryDialog
              open={!!libToMove}
              onOpenChange={open => !open && setLibToMove(null)}
              libraryId={libToMove}
            />
          )}
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default Libraries;
