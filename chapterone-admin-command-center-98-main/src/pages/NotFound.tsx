import { Link } from 'react-router-dom';
import { Settings, Home, BookOpen, ArrowLeft, Shield } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <div className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-700 animate-pulse">
            404
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-700/20 via-blue-700/20 to-indigo-700/20 blur-3xl rounded-full"></div>
        </div>

        {/* Floating Admin Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
            <Settings className="w-12 h-12 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-600/30 to-blue-600/30 rounded-2xl blur-xl"></div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          The admin panel page you're looking for doesn't exist. 
          Let's get you back to managing your digital library efficiently.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-slate-700 to-blue-700 text-white font-semibold rounded-xl hover:from-slate-800 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <Link
            to="/books"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Manage Books
          </Link>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center text-slate-500 hover:text-slate-700 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
          <div className="flex items-center justify-center text-blue-700 mb-2">
            <Shield className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Secure Access</span>
          </div>
          <p className="text-xs text-blue-600">
            All admin actions are logged and monitored for security purposes.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-slate-200 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-5 w-12 h-12 bg-indigo-200 rounded-full opacity-20 animate-bounce"></div>
      </div>
    </div>
  );
};

export default NotFound;
