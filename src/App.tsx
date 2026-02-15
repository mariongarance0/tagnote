import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotesProvider } from "@/contexts/NotesContext";
import { AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import Dashboard from "./pages/Dashboard";
import NoteCreate from "./pages/NoteCreate";
import NoteView from "./pages/NoteView";
import Libraries from "./pages/Libraries";
import LibraryView from "./pages/LibraryView";
import TagsSearch from "./pages/TagsSearch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NotesProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new" element={<NoteCreate />} />
              <Route path="/note/:id" element={<NoteView />} />
              <Route path="/libraries" element={<Libraries />} />
              <Route path="/library/:id" element={<LibraryView />} />
              <Route path="/search" element={<TagsSearch />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          <BottomNav />
        </BrowserRouter>
      </NotesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
