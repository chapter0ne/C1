import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login, register } = useAuth();

  React.useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        await register({ username, email, password, fullName });
        toast.success("Account created and signed in");
      } else {
        await login(email, password);
        toast.success("Signed in successfully");
      }
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || (isSignUp ? "Sign up failed" : "Sign in failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-[#D01E1E] flex items-center justify-center rounded">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ChapterOne</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-gray-600">
            {isSignUp 
              ? "Join thousands of readers discovering their next favorite book"
              : "Sign in to your account to continue reading"
            }
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
          {isSignUp && (
            <>
              <div>
                <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700">Username</label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-fullname" className="block text-sm font-medium text-gray-700">Full Name</label>
                <Input
                  id="signup-fullname"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Sign Up" : "Sign In")}
          </Button>
        </form>
        <div className="text-center mt-4">
          <button
            type="button"
            className="text-[#D01E1E] hover:underline text-sm"
            onClick={() => setIsSignUp((v) => !v)}
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
