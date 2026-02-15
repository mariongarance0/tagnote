import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '@/contexts/NotesContext';
import { ArrowLeft, Trash2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

const NoteView = () => {
  const { id } = useParams<{ id: string }>();
  const { getNoteById, getLibraryById, deleteNote } = useNotes();
  const navigate = useNavigate();

  const note = id ? getNoteById(id) : undefined;
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

  const handleDelete = () => {
    deleteNote(note.id);
    navigate(-1);
  };

  return (
    <PageTransition>
      <div className="min-h-screen max-w-lg mx-auto">
        <div className="sticky top-0 z-10 glass-surface bg-background/90 px-4 py-3 flex items-center justify-between border-b border-border">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 active:opacity-60">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <button onClick={handleDelete} className="p-1 -mr-1 active:opacity-60">
            <Trash2 size={20} className="text-destructive" />
          </button>
        </div>

        <div className="px-5 pt-6 pb-12">
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
                <span key={tag} className="px-2.5 py-0.5 rounded-full bg-tag-bg text-tag-foreground text-[12px] font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
            {note.content}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default NoteView;
