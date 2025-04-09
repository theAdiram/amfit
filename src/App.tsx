
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Index from "./pages/Index";
import WorkoutsPage from "./pages/WorkoutsPage";
import WorkoutDetailPage from "./pages/WorkoutDetailPage";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component to check auth
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, hasCompletedOnboarding } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (user && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

// Route that checks if user has completed onboarding
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, hasCompletedOnboarding } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (user && hasCompletedOnboarding) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Public route that redirects authenticated users
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, hasCompletedOnboarding } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (user) {
    if (!hasCompletedOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
    <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />
    
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/workouts" element={<ProtectedRoute><WorkoutsPage /></ProtectedRoute>} />
    <Route path="/workouts/:id" element={<ProtectedRoute><WorkoutDetailPage /></ProtectedRoute>} />
    <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
