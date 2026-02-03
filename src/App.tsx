import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dogs from "./pages/Dogs";
import DogProfile from "./pages/DogProfile";
import Leaderboard from "./pages/Leaderboard";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import AddDog from "./pages/AddDog";
import AdminPanel from "./pages/AdminPanel";
import ScanQR from "./pages/ScanQR";
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
          <Route path="/dogs" element={<Dogs />} />
          <Route path="/dog/:id" element={<DogProfile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-dog" element={<AddDog />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/scan" element={<ScanQR />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
