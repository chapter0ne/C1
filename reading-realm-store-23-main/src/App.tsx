
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EnhancedBrowseBooks from "./pages/EnhancedBrowseBooks";
import EnhancedLibrary from "./pages/EnhancedLibrary";
import EnhancedBookDetails from "./pages/EnhancedBookDetails";
import EnhancedBookReader from "./pages/EnhancedBookReader";
import ReadingLists from "./pages/ReadingLists";
import ReadingListDetails from "./pages/ReadingListDetails";
import CurateList from "./pages/CurateList";
import UserProfile from "./pages/UserProfile";
import MyProfile from "./pages/MyProfile";
import Search from "./pages/Search";
import AuthorPage from "./pages/AuthorPage";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BookDetails from "./pages/BookDetails";
import { useAuth } from '@/contexts/AuthContext';
import { UserDataProvider } from '@/contexts/UserDataContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1
    }
  },
});

const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/browse" element={<Navigate to="/explore" replace />} />
        <Route path="/explore" element={<ProtectedRoute><EnhancedBrowseBooks /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><EnhancedLibrary /></ProtectedRoute>} />
        <Route path="/book/:id" element={<ProtectedRoute><BookDetails /></ProtectedRoute>} />
        <Route path="/book/:id/read" element={<ProtectedRoute><EnhancedBookReader /></ProtectedRoute>} />
        <Route path="/reading-lists" element={<ProtectedRoute><ReadingLists /></ProtectedRoute>} />
        <Route path="/reading-list/:id" element={<ProtectedRoute><ReadingListDetails /></ProtectedRoute>} />
        <Route path="/curate-list" element={<ProtectedRoute><CurateList /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/author/:authorName" element={<ProtectedRoute><AuthorPage /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </UserDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
