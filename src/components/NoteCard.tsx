import { Note } from '@/contexts/NotesContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTagStyle } from '@/lib/tagColor';

interface NoteCardProps {
  note: Note;
  index?: number;
}

const NoteCard = ({ note, index = 0 }: NoteCardProps) => {
  const navigate = useNavigate();
  const preview = note.content.length > 80 ? note.content.slice(0, 80) + '…' : note.content;
  const date = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => navigate(`/note/${note.id}`)}
      className="w-full text-left bg-card rounded-2xl p-4 shadow-card active:scale-[0.98] transition-transform duration-150"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-[15px] text-foreground leading-tight line-clamp-1">
          {note.title || 'Untitled'}
        </h3>
        <span className="text-[11px] text-text-tertiary whitespace-nowrap mt-0.5">{date}</span>
      </div>
      {preview && (
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{preview}</p>
      )}
      {note.tags.length > 0 && (
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {note.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={getTagStyle(tag)}>
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[11px] text-text-tertiary">+{note.tags.length - 3}</span>
          )}
        </div>
      )}
    </motion.button>
  );
};

export default NoteCard;
