
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (!hasLoggedRef.current) {
      console.log('ProtectedRoute - Loading:', loading, 'User:', !!user, 'Path:', location.pathname);
      hasLoggedRef.current = true;
    }
  }, [loading, user, location.pathname]);

  // Show loading while auth is initializing
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

  // If no user after auth loads, redirect to auth
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // If user exists, render children
  return <>{children}</>;
};

export default ProtectedRoute;
