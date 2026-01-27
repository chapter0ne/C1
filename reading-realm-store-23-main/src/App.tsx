
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import PaymentVerification from "./pages/PaymentVerification";
import Wishlist from "./pages/Wishlist";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BookDetails from "./pages/BookDetails";
import { useAuth } from '@/contexts/AuthContext';
import { OptimizedUserDataProvider } from '@/contexts/OptimizedUserDataContext';
import { saveScrollPosition, restoreScrollPosition } from '@/utils/scrollRestoration';
import { useEffect, useRef } from 'react';
import '@/utils/viewportFix';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Faster failure
      staleTime: 15 * 60 * 1000, // 15 minutes - longer cache
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      gcTime: 30 * 60 * 1000, // 30 minutes garbage collection time
      retryDelay: 1000, // Quick retry
    },
    mutations: {
      retry: 1,
      retryDelay: 1000
    }
  },
});

// Component to handle scroll restoration (must be inside Router)
const ScrollRestoration = () => {
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;

    // Save scroll position of the previous page
    if (prevPath !== currentPath) {
      saveScrollPosition(prevPath);
    }

    // Restore scroll position immediately to prevent visible jump
    restoreScrollPosition(currentPath);

    // Update the previous path reference
    prevPathRef.current = currentPath;
  }, [location.pathname]);

  return null;
};

const AppRoutes = () => {
  const { loading, user } = useAuth();
  
  // Show minimal loading state
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
      <ScrollRestoration />
      <Routes>
        {/* Redirect to auth if not authenticated, otherwise show homepage */}
        <Route path="/" element={
          user ? <Index /> : <Navigate to="/auth" replace />
        } />
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
        <Route path="/payment/verify" element={<ProtectedRoute><PaymentVerification /></ProtectedRoute>} />
        <Route path="/payment-verification" element={<ProtectedRoute><PaymentVerification /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <OptimizedUserDataProvider>
            <AppRoutes />
          </OptimizedUserDataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
