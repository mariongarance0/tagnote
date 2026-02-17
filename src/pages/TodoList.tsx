import { useState } from 'react';
import { useTodos } from '@/contexts/TodosContext';
import PageTransition from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check } from 'lucide-react';

const TodoList = () => {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    addTodo(input);
    setInput('');
  };

  const pending = todos.filter(t => !t.completed);
  const completed = todos.filter(t => t.completed);

  return (
    <PageTransition>
      <div className="safe-bottom px-5 pt-14 pb-6 max-w-lg mx-auto">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground mb-1">To do list</h1>
        <p className="text-muted-foreground text-[15px] mb-6">
          {todos.length === 0
            ? 'Add your first task'
            : `${pending.length} to do${pending.length !== 1 ? 's' : ''}${completed.length > 0 ? ` · ${completed.length} done` : ''}`}
        </p>

        {/* Add new todo */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="What do you need to do?"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1 text-[15px] px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground/50 border-none outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            disabled={!input.trim()}
            className="shrink-0 w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
            aria-label="Add task"
          >
            <Plus size={22} strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* List */}
        {todos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <Check size={26} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-[15px]">Your tasks will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {pending.map((todo, i) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 shadow-card"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="shrink-0 w-7 h-7 rounded-full border-2 border-muted-foreground/50 flex items-center justify-center hover:border-primary transition-colors"
                    aria-label={todo.completed ? 'Mark incomplete' : 'Mark done'}
                  >
                    {todo.completed && <Check size={14} className="text-primary" strokeWidth={3} />}
                  </button>
                  <span className="flex-1 text-[15px] text-foreground">{todo.text}</span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1.5 -mr-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
              {completed.map(todo => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 shadow-card opacity-80"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                    aria-label="Mark incomplete"
                  >
                    <Check size={14} className="text-primary-foreground" strokeWidth={3} />
                  </button>
                  <span className="flex-1 text-[15px] text-muted-foreground line-through">{todo.text}</span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1.5 -mr-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default TodoList;
