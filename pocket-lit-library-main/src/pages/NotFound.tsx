import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-chapterRed-50 to-chapterRed-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto px-6"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-3">
            <BookOpen size={48} className="text-chapterRed-500" />
            <span className="text-3xl font-light tracking-tighter">
              <span className="font-light">Chapter</span>
              <span className="font-semibold">One</span>
            </span>
          </div>
        </motion.div>

        {/* 404 Number */}
        <motion.h1 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-8xl md:text-9xl font-bold text-chapterRed-500 mb-4"
        >
          404
        </motion.h1>

        {/* Error Message */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4"
        >
          Oops! Page Not Found
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-lg text-gray-600 mb-8 max-w-md mx-auto"
        >
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to reading amazing stories!
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link 
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-chapterRed-500 text-white rounded-lg hover:bg-chapterRed-600 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 border border-chapterRed-500 text-chapterRed-500 rounded-lg hover:bg-chapterRed-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </motion.div>

        {/* Additional Help */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-sm text-gray-500"
        >
          <p>Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link to="/#about" className="text-chapterRed-500 hover:text-chapterRed-600 underline">
              About Us
            </Link>
            <Link to="/#writeyourchapterone" className="text-chapterRed-500 hover:text-chapterRed-600 underline">
              #WriteYourChapterOne
            </Link>
            <Link to="/#publishers" className="text-chapterRed-500 hover:text-chapterRed-600 underline">
              Publishers
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
