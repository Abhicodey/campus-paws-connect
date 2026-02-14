import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider"; // Added import
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dogs from "./pages/Dogs";
import DogProfile from "./pages/DogProfile";
import DogProfileByQR from "./pages/DogProfileByQR";
import Leaderboard from "./pages/Leaderboard";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import AddDog from "./pages/AddDog";
import AdminPanel from "./pages/AdminPanel";
import ScanQR from "./pages/ScanQR";
import Login from "./pages/Login";
import UsernameSetup from "./pages/UsernameSetup";
import ReportDog from "./pages/ReportDog";
import Guidelines from "./pages/Guidelines";
import Community from "./pages/Community";
import Donate from "./pages/Donate";
import CreateAnnouncement from "./pages/CreateAnnouncement";
import NotFound from "./pages/NotFound";
import AppLayout from "@/layouts/AppLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Standalone Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/setup-username" element={<UsernameSetup />} />

              {/* App Layout Routes */}
              <Route element={<AppLayout />}>
                {/* Public & Semi-public */}
                <Route path="/" element={<Index />} />
                <Route path="/dogs" element={<Dogs />} />
                <Route path="/dog/qr/:qrCode" element={<DogProfileByQR />} />
                <Route path="/dog/:id" element={<DogProfile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/guidelines" element={<Guidelines />} />
                <Route path="/community" element={<Community />} />
                <Route path="/donate" element={<Donate />} />

                {/* Protected Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/add-dog" element={
                  <ProtectedRoute>
                    <AddDog />
                  </ProtectedRoute>
                } />
                <Route path="/scan" element={
                  <ProtectedRoute>
                    <ScanQR />
                  </ProtectedRoute>
                } />
                <Route path="/report-dog" element={
                  <ProtectedRoute>
                    <ReportDog />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="/admin/announcements/create" element={
                  <ProtectedRoute>
                    <CreateAnnouncement />
                  </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
