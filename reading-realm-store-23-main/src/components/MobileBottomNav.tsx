
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Home, Search, Heart, List } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Don't show on login/signup pages or if user is not logged in
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/auth' || !user) {
    return null;
  }
  
  const isActive = (path: string) => location.pathname === path;
  
  const getIconClass = (path: string) => 
    isActive(path) ? "w-5 h-5 text-[#D01E1E]" : "w-5 h-5 text-gray-600";
    
  const getTextClass = (path: string) => 
    isActive(path) ? "text-xs text-[#D01E1E] mt-1 font-medium" : "text-xs text-gray-600 mt-1";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-1 px-4">
        {/* Home button */}
        <Link to="/" className="flex flex-col items-center p-1 flex-1">
          <Home className={getIconClass('/')} />
          <span className={getTextClass('/')}>Home</span>
        </Link>
        
        {/* Explore button */}
        <Link to="/explore" className="flex flex-col items-center p-1 flex-1">
          <BookOpen className={getIconClass('/explore')} />
          <span className={getTextClass('/explore')}>Explore</span>
        </Link>

        {/* Central Search Button */}
        <Link to="/search" className="flex flex-col items-center p-2 mx-2">
          <div className="w-14 h-16 bg-[#D01E1E] rounded-full flex items-center justify-center shadow-lg -mt-3">
            <Search className="w-7 h-7 text-white" />
          </div>
        </Link>
        
        {/* Library button */}
        <Link to="/library" className="flex flex-col items-center p-1 flex-1">
          <svg className={getIconClass('/library')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className={getTextClass('/library')}>Library</span>
        </Link>
        
        {/* Wishlist button */}
        <Link to="/wishlist" className="flex flex-col items-center p-1 flex-1">
          <Heart className={getIconClass('/wishlist')} />
          <span className={getTextClass('/wishlist')}>Wishlist</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNav;
