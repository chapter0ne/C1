import { Link } from 'react-router-dom';
import { BookOpen, Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-rose-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center relative">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <div className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D01E1E] via-[#B01818] to-[#8B1212] animate-pulse">
            404
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#D01E1E]/20 via-[#B01818]/20 to-[#8B1212]/20 blur-3xl rounded-full"></div>
        </div>

        {/* Floating Book Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#D01E1E] to-[#B01818] rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#D01E1E]/30 to-[#B01818]/30 rounded-2xl blur-xl"></div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for seems to have wandered off into the digital wilderness. 
          Don't worry, we'll help you find your way back to great reading!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#D01E1E] hover:bg-[#B01818] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-[#D01E1E] hover:text-[#D01E1E] transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Search className="w-5 h-5 mr-2" />
            Explore Books
          </Link>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center text-gray-500 hover:text-[#D01E1E] transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>

        {/* Decorative Elements with ChapterOne colors */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#D01E1E]/20 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-[#B01818]/20 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-5 w-12 h-12 bg-[#D01E1E]/20 rounded-full opacity-20 animate-bounce"></div>
      </div>
    </div>
  );
};

export default NotFound;
