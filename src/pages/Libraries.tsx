import { useNotes } from '@/contexts/NotesContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BookOpen } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';

const Libraries = () => {
  const { libraries, getNotesForLibrary } = useNotes();
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="safe-bottom px-5 pt-14 pb-6 max-w-lg mx-auto">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground mb-1">Libraries</h1>
        <p className="text-muted-foreground text-[15px] mb-8">
          {libraries.length} {libraries.length === 1 ? 'library' : 'libraries'}
        </p>

        {libraries.length === 0 ? (
          <div className="text-center mt-16">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-[15px]">Create a library when adding a note</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {libraries.map((lib, i) => {
              const count = getNotesForLibrary(lib.id).length;
              return (
                <motion.button
                  key={lib.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/library/${lib.id}`)}
                  className="w-full flex items-center justify-between bg-card rounded-2xl px-4 py-3.5 shadow-card active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                      <BookOpen size={18} className="text-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[15px] text-foreground">{lib.name}</p>
                      <p className="text-[12px] text-muted-foreground">{count} note{count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-text-tertiary" />
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Libraries;
