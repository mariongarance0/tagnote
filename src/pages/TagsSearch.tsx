import { useState, useMemo } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import NoteCard from '@/components/NoteCard';
import PageTransition from '@/components/PageTransition';
import { Search as SearchIcon, Trash2 } from 'lucide-react';
import { getTagStyle } from '@/lib/tagColor';
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

const TagsSearch = () => {
  const { notes, tags, deleteTag } = useNotes();
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any');

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filtered = useMemo(() => {
    let result = notes;
    if (selectedTags.length > 0) {
      result = result.filter(n =>
        matchMode === 'any'
          ? selectedTags.some(t => n.tags.includes(t))
          : selectedTags.every(t => n.tags.includes(t))
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, selectedTags, query, matchMode]);

  return (
    <PageTransition>
      <div className="safe-bottom px-5 pt-14 pb-6 max-w-lg mx-auto">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground mb-5">Search</h1>

        {/* Search Bar */}
        <div className="relative mb-5">
          <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-foreground text-[14px] placeholder:text-muted-foreground/50 border-none outline-none"
          />
        </div>

        {/* Tag Filters */}
        {tags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                Filter by Tags
              </h2>
              {selectedTags.length > 1 && (
                <div className="flex items-center gap-1 bg-secondary rounded-full p-0.5">
                  <button
                    onClick={() => setMatchMode('any')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      matchMode === 'any' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    Any
                  </button>
                  <button
                    onClick={() => setMatchMode('all')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      matchMode === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    All
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <div key={tag} className="relative group">
                  <button
                    onClick={() => toggleTag(tag)}
                    style={getTagStyle(tag)}
                    className={`pl-3 pr-7 py-1.5 rounded-full text-[13px] font-medium transition-all active:scale-95 ${
                      selectedTags.includes(tag) ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    }`}
                  >
                    {tag}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setTagToDelete(tag); }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>

            <AlertDialog open={!!tagToDelete} onOpenChange={open => !open && setTagToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete tag "{tagToDelete}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the tag from all notes, but the notes themselves won't be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => { if (tagToDelete) { deleteTag(tagToDelete); setTagToDelete(null); setSelectedTags(prev => prev.filter(t => t !== tagToDelete)); } }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete tag
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Results */}
        <div className="flex flex-col gap-2.5">
          {filtered.length > 0 ? (
            filtered.map((note, i) => <NoteCard key={note.id} note={note} index={i} />)
          ) : (
            <p className="text-center text-muted-foreground text-[15px] mt-8">
              {query || selectedTags.length > 0 ? 'No matching notes' : 'Start typing to search'}
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default TagsSearch;
