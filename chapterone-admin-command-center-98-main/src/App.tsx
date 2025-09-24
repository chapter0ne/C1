
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Upload from "./pages/Upload";
import UserManagement from "./pages/UserManagement";
import FeaturedBooksManagement from "./pages/FeaturedBooksManagement";
import NotFound from "./pages/NotFound";
import Books from "./pages/Books";
import Drafts from './pages/Drafts';
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry auth errors or timeout errors
        if (error instanceof Error && (
          error.message.includes('401') || 
          error.message.includes('403') || 
          error.message.includes('Authentication') ||
          error.message.includes('timeout') ||
          error.message.includes('AbortError')
        )) {
          return false;
        }
        // More conservative retry for network errors
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 10000), // Reduced max delay
      staleTime: 1 * 60 * 1000, // 1 minute to prevent stale data issues
      gcTime: 3 * 60 * 1000, // 3 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      // Better network mode handling
      networkMode: 'online',
      // Note: Individual query functions should implement their own timeouts
      // This configuration ensures queries don't hang indefinitely
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry auth errors, timeouts, or client errors
        if (error instanceof Error && (
          error.message.includes('401') || 
          error.message.includes('403') || 
          error.message.includes('Authentication') ||
          error.message.includes('timeout') ||
          error.message.includes('AbortError') ||
          error.message.includes('4') // Client errors
        )) {
          return false;
        }
        // No retry for mutations to prevent hanging
        return false;
      },
      retryDelay: 2000,
    },
  },
});

function App() {
  // Add cleanup effect for query client
  useEffect(() => {
    // Clear query cache on app mount to prevent stale data issues
    queryClient.clear();
    
    // Network status monitoring
    const handleOnline = () => {
      console.log('Network connection restored');
      // Refetch critical queries when back online
      queryClient.refetchQueries({ queryKey: ['auth'] });
    };
    
    const handleOffline = () => {
      console.log('Network connection lost');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      // Only clear cache on unmount, don't interfere with ongoing operations
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Index />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Upload />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload/:bookId"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Upload />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <UserManagement />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/featured-books"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <FeaturedBooksManagement />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/books"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Books />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/drafts"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Drafts />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                {/* Catch-all route for unmatched paths */}
                <Route 
                  path="*" 
                  element={
                    <ErrorBoundary>
                      <NotFound />
                    </ErrorBoundary>
                  } 
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
