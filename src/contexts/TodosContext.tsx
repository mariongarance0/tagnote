import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY_PREFIX = 'tagnote_todos_';

interface TodosContextType {
  todos: TodoItem[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

const TodosContext = createContext<TodosContextType | null>(null);

function generateId(): string {
  return crypto.randomUUID?.() ?? `todo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export const TodosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);

  const storageKey = user ? `${STORAGE_KEY_PREFIX}${user.id}` : null;

  useEffect(() => {
    if (!storageKey) {
      setTodos([]);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as TodoItem[];
        if (Array.isArray(parsed)) {
          setTodos(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setTodos([]);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(todos));
    } catch {
      // ignore
    }
  }, [storageKey, todos]);

  const addTodo = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    const newTodo: TodoItem = {
      id: generateId(),
      text: t,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <TodosContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo }}>
      {children}
    </TodosContext.Provider>
  );
};

export const useTodos = () => {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('useTodos must be used within TodosProvider');
  return ctx;
};
