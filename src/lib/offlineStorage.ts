// Offline storage and sync queue for notes

const OFFLINE_NOTES_KEY = 'tagnote_offline_notes';
const OFFLINE_LIBRARIES_KEY = 'tagnote_offline_libraries';
const PENDING_QUEUE_KEY = 'tagnote_pending_queue';

export interface PendingAction {
  id: string;
  type: 'create_note' | 'update_note' | 'delete_note';
  payload: any;
  timestamp: number;
}

// Cache notes/libraries to localStorage
export const cacheNotes = (notes: any[]) => {
  try {
    localStorage.setItem(OFFLINE_NOTES_KEY, JSON.stringify(notes));
  } catch {}
};

export const cacheLibraries = (libraries: any[]) => {
  try {
    localStorage.setItem(OFFLINE_LIBRARIES_KEY, JSON.stringify(libraries));
  } catch {}
};

export const getCachedNotes = (): any[] => {
  try {
    const data = localStorage.getItem(OFFLINE_NOTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getCachedLibraries = (): any[] => {
  try {
    const data = localStorage.getItem(OFFLINE_LIBRARIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Pending actions queue
export const getPendingActions = (): PendingAction[] => {
  try {
    const data = localStorage.getItem(PENDING_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addPendingAction = (action: Omit<PendingAction, 'id' | 'timestamp'>) => {
  const pending = getPendingActions();
  // For updates, replace existing pending update for same note
  if (action.type === 'update_note') {
    const idx = pending.findIndex(
      p => p.type === 'update_note' && p.payload.id === action.payload.id
    );
    if (idx >= 0) {
      pending[idx] = {
        ...pending[idx],
        payload: { ...pending[idx].payload, ...action.payload },
        timestamp: Date.now(),
      };
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(pending));
      return;
    }
  }
  pending.push({
    id: crypto.randomUUID(),
    ...action,
    timestamp: Date.now(),
  });
  localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(pending));
};

export const clearPendingActions = () => {
  localStorage.removeItem(PENDING_QUEUE_KEY);
};

export const removePendingAction = (id: string) => {
  const pending = getPendingActions().filter(a => a.id !== id);
  localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(pending));
};

export const isOnline = () => navigator.onLine;
