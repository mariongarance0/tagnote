import { useNotes } from '@/contexts/NotesContext';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import NoteCard from '@/components/NoteCard';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { notes } = useNotes();
  const navigate = useNavigate();
  const recentNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10);

  return (
    <PageTransition>
      <div className="safe-bottom px-5 pt-14 pb-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <img
            src="/monkey_no_background.png"
            alt="TagNote"
            className="h-10 w-auto object-contain shrink-0"
          />
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground">TagNote</h1>
            <p className="text-muted-foreground text-[15px] mt-0.5">
            {notes.length === 0 ? 'Start capturing your thoughts' : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* New Note Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/new')}
          className="w-full flex items-center justify-center gap-2.5 bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-[15px] shadow-medium mb-8 active:opacity-90 transition-opacity"
        >
          <Plus size={20} strokeWidth={2.5} />
          New Note
        </motion.button>

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <div>
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Recent Notes
            </h2>
            <div className="flex flex-col gap-2.5">
              {recentNotes.map((note, i) => (
                <NoteCard key={note.id} note={note} index={i} />
              ))}
            </div>
          </div>
        )}

        {notes.length === 0 && (
          <div className="text-center mt-16">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Plus size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-[15px]">Your notes will appear here</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Dashboard;
