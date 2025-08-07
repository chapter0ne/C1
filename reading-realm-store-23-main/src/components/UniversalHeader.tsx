
import { Link, useLocation } from "react-router-dom";
import { BookOpen, ShoppingCart, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

interface UniversalHeaderProps {
  currentPage?: string;
}

const UniversalHeader = ({ currentPage }: UniversalHeaderProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const userId = user?.id || '';
  const { cart } = useCart(userId);
  const cartCount = cart?.items?.length || 0;

  // Hide header on auth pages
  if (["/auth", "/login", "/signup"].includes(location.pathname)) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
                <ShoppingCart className="w-5 h-5 text-gray-600 hover:text-[#D01E1E]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D01E1E] text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
            {/* Mobile: Only Cart icon */}
            <div className="md:hidden flex items-center">
              <Link to="/cart" className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-600 hover:text-[#D01E1E]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D01E1E] text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UniversalHeader;
