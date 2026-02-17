import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotesProvider } from "@/contexts/NotesContext";
import { TodosProvider } from "@/contexts/TodosContext";
import { AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import Dashboard from "./pages/Dashboard";
import NoteCreate from "./pages/NoteCreate";
import NoteView from "./pages/NoteView";
import Libraries from "./pages/Libraries";
import LibraryView from "./pages/LibraryView";
import TagsSearch from "./pages/TagsSearch";
import TodoList from "./pages/TodoList";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AppRoutes = () => (
  <NotesProvider>
    <TodosProvider>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/new" element={<ProtectedRoute><NoteCreate /></ProtectedRoute>} />
          <Route path="/note/:id" element={<ProtectedRoute><NoteView /></ProtectedRoute>} />
          <Route path="/libraries" element={<ProtectedRoute><Libraries /></ProtectedRoute>} />
          <Route path="/library/:id" element={<ProtectedRoute><LibraryView /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><TagsSearch /></ProtectedRoute>} />
          <Route path="/todo" element={<ProtectedRoute><TodoList /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <BottomNav />
    </TodosProvider>
  </NotesProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
