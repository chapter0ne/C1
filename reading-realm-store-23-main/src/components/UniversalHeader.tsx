
import { Link, useLocation } from "react-router-dom";
import { BookOpen, ShoppingCart, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { useState, useEffect } from "react";

interface UniversalHeaderProps {
  currentPage?: string;
}

const UniversalHeader = ({ currentPage }: UniversalHeaderProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const userId = user?.id || '';
  const { cart } = useCart(userId);
  const cartCount = cart?.items?.length || 0;
  
  // Debug logging
  console.log('UniversalHeader cart data:', { cart, cartCount, userId });
  const { effectiveHeight } = useViewportHeight();
  const [headerTop, setHeaderTop] = useState(0);

  // Update header positioning when viewport changes
  useEffect(() => {
    // Ensure header stays at top even when viewport changes
    setHeaderTop(0);
  }, [effectiveHeight]);

  // Hide header on auth pages
  if (["/auth", "/login", "/signup"].includes(location.pathname)) return null;

  return (
    <header 
      className="backdrop-blur-xl bg-white/30 border-b border-white/20 shadow-2xl sticky z-50"
      style={{ top: `${headerTop}px` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#D01E1E] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ChapterOne</span>
            </Link>
          </div>

          {/* Desktop/Tablet Nav */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/"
              className={`transition-colors ${location.pathname === '/' ? 'text-[#D01E1E] font-medium' : 'text-gray-700 hover:text-[#D01E1E]'}`}
            >
              Home
            </Link>
            <Link 
              to="/explore"
              className={`transition-colors ${location.pathname === '/explore' ? 'text-[#D01E1E] font-medium' : 'text-gray-700 hover:text-[#D01E1E]'}`}
            >
              Explore
            </Link>
            <Link 
              to="/library"
              className={`transition-colors ${location.pathname === '/library' ? 'text-[#D01E1E] font-medium' : 'text-gray-700 hover:text-[#D01E1E]'}`}
            >
              Library
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Desktop/Tablet: Search, Cart with counters */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/search">
                <Search className="w-5 h-5 text-[#D01E1E] hover:text-[#B01818]" />
              </Link>
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="sm" className="rounded-full p-2 border-2 border-[#D01E1E] hover:bg-red-50">
                  <ShoppingCart className="w-5 h-5 text-[#D01E1E]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#D01E1E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
            {/* Mobile: Only Cart icon */}
            <div className="md:hidden flex items-center">
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="sm" className="rounded-full p-2 border-2 border-[#D01E1E] hover:bg-red-50">
                  <ShoppingCart className="w-5 h-5 text-[#D01E1E]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#D01E1E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UniversalHeader;
