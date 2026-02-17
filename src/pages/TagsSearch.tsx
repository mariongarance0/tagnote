import { useState, useMemo } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import NoteCard from '@/components/NoteCard';
import PageTransition from '@/components/PageTransition';
import { Search as SearchIcon } from 'lucide-react';

const TagsSearch = () => {
  const { notes, tags } = useNotes();
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
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all active:scale-95 ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-tag-bg text-tag-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
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
