import { useState } from 'react';
import { useNotes, Library } from '@/contexts/NotesContext';
import { ChevronRight, FolderOpen, BookOpen, Home, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  libraryId: string;
  onMoved?: () => void;
}

const MoveLibraryDialog = ({ open, onOpenChange, libraryId, onMoved }: Props) => {
  const { libraries, getChildLibraries, getLibraryById, moveLibrary, getLibraryPath } = useNotes();
  const [selectedParentId, setSelectedParentId] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const currentLibrary = getLibraryById(libraryId);
  const currentParentId = currentLibrary?.parentId ?? null;

  // The "effective" selection: undefined means "no change yet"
  const effectiveSelection = selectedParentId === undefined ? currentParentId : selectedParentId;

  // Build list of all valid destination libraries (exclude self and descendants)
  const isDescendantOrSelf = (candidateId: string): boolean => {
    if (candidateId === libraryId) return true;
    const candidate = libraries.find(l => l.id === candidateId);
    return candidate?.parentId ? isDescendantOrSelf(candidate.parentId) : false;
  };

  const validLibraries = libraries.filter(l => !isDescendantOrSelf(l.id));

  // Render a tree of valid destinations
  const renderTree = (parentId: string | null, depth = 0): JSX.Element[] => {
    const children = validLibraries.filter(l => l.parentId === parentId);
    return children.flatMap(lib => {
      const isSelected = effectiveSelection === lib.id;
      const hasSubChildren = validLibraries.some(l => l.parentId === lib.id);
      return [
        <button
          key={lib.id}
          onClick={() => setSelectedParentId(lib.id)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary active:opacity-70'
          }`}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isSelected ? 'bg-primary-foreground/20' : 'bg-secondary'
          }`}>
            {hasSubChildren
              ? <FolderOpen size={14} className={isSelected ? 'text-primary-foreground' : 'text-foreground'} />
              : <BookOpen size={14} className={isSelected ? 'text-primary-foreground' : 'text-foreground'} />
            }
          </div>
          <span className={`text-[14px] font-medium flex-1 truncate ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
            {lib.name}
          </span>
          {isSelected && <Check size={14} className="text-primary-foreground flex-shrink-0" />}
        </button>,
        ...renderTree(lib.id, depth + 1),
      ];
    });
  };

  const handleMove = async () => {
    if (selectedParentId === undefined) return; // nothing changed
    setLoading(true);
    try {
      await moveLibrary(libraryId, selectedParentId);
      onOpenChange(false);
      setSelectedParentId(undefined);
      onMoved?.();
    } finally {
      setLoading(false);
    }
  };

  const hasChanged = selectedParentId !== undefined && selectedParentId !== currentParentId;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setSelectedParentId(undefined); onOpenChange(o); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Move "{currentLibrary?.name}"</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto -mx-1 px-1">
          {/* Root option */}
          <button
            onClick={() => setSelectedParentId(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
              effectiveSelection === null
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary active:opacity-70'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              effectiveSelection === null ? 'bg-primary-foreground/20' : 'bg-secondary'
            }`}>
              <Home size={14} className={effectiveSelection === null ? 'text-primary-foreground' : 'text-foreground'} />
            </div>
            <span className={`text-[14px] font-medium ${effectiveSelection === null ? 'text-primary-foreground' : 'text-foreground'}`}>
              Root (top level)
            </span>
            {effectiveSelection === null && <Check size={14} className="text-primary-foreground ml-auto" />}
          </button>

          {renderTree(null)}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setSelectedParentId(undefined); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!hasChanged || loading}>
            {loading ? 'Moving…' : 'Move here'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveLibraryDialog;
