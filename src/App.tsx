import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Anime from "./pages/Anime";
import AnimeDetails from "./pages/AnimeDetails";
import Schedule from "./pages/Schedule";
import Movies from "./pages/Movies";
import Watch from "./pages/Watch";
import Admin from "./pages/Admin";
import Manga from "./pages/Manga";
import MangaDetails from "./pages/MangaDetails";
import ReadChapter from "./pages/ReadChapter";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/watch/:episodeId" element={<Watch />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/manga" element={<Manga />} />
          <Route path="/manga/:id" element={<MangaDetails />} />
          <Route path="/manga/:mangaId/chapter/:chapterId" element={<ReadChapter />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
