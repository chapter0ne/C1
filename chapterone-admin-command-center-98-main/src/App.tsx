
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
        // Don't retry auth errors
        if (error instanceof Error && (
          error.message.includes('401') || 
          error.message.includes('403') || 
          error.message.includes('Authentication')
        )) {
          return false;
        }
        // Retry network errors up to 2 times
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 2 * 60 * 1000, // 2 minutes (reduced from 5)
      gcTime: 5 * 60 * 1000, // 5 minutes (reduced from 10)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      // Add network mode for better offline handling
      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry auth errors
        if (error instanceof Error && (
          error.message.includes('401') || 
          error.message.includes('403') || 
          error.message.includes('Authentication')
        )) {
          return false;
        }
        // Retry network errors up to 1 time
        return failureCount < 1;
      },
      retryDelay: 1000,
    },
  },
});

function App() {
  // Add cleanup effect for query client
  useEffect(() => {
    // Clear query cache on app mount to prevent stale data issues
    queryClient.clear();
    
    // Set up periodic cleanup
    const cleanupInterval = setInterval(() => {
      // Remove stale queries
      queryClient.removeQueries({
        predicate: (query) => {
          const queryState = query.state;
          return queryState.dataUpdatedAt < Date.now() - (10 * 60 * 1000); // 10 minutes
        }
      });
    }, 5 * 60 * 1000); // Every 5 minutes
    
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
      clearInterval(cleanupInterval);
      queryClient.clear();
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
