import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '@/contexts/NotesContext';
import { ArrowLeft } from 'lucide-react';
import NoteCard from '@/components/NoteCard';
import PageTransition from '@/components/PageTransition';

const LibraryView = () => {
  const { id } = useParams<{ id: string }>();
  const { getLibraryById, getNotesForLibrary } = useNotes();
  const navigate = useNavigate();

  const library = id ? getLibraryById(id) : undefined;
  const notes = id ? getNotesForLibrary(id) : [];

  if (!library) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Library not found</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen max-w-lg mx-auto safe-bottom">
        <div className="sticky top-0 z-10 glass-surface bg-background/90 px-4 py-3 flex items-center gap-3 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 active:opacity-60">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">{library.name}</h2>
            <p className="text-[11px] text-muted-foreground">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="px-5 pt-4 pb-6">
          {notes.length === 0 ? (
            <p className="text-center text-muted-foreground text-[15px] mt-16">No notes in this library yet</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {notes.map((note, i) => (
                <NoteCard key={note.id} note={note} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default LibraryView;
