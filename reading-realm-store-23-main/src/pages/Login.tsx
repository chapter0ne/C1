
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 font-archivo flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background with blur effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          filter: "blur(8px) brightness(0.7)"
        }}
      ></div>
      <div className="absolute inset-0 bg-black/30"></div>
      
      <Card className="w-full max-w-md relative z-10 border-0 shadow-xl bg-white/95 backdrop-blur-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#D01E1E] mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? "Create Account" : "Sign In"}
            </h1>
          </div>

          <form className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="h-11 px-4 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-[#D01E1E] focus:ring-1 focus:ring-[#D01E1E] font-archivo"
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="h-11 px-4 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-[#D01E1E] focus:ring-1 focus:ring-[#D01E1E] font-archivo"
                />
              </div>
            )}

            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-[#D01E1E] focus:ring-1 focus:ring-[#D01E1E] font-archivo"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-[#D01E1E] focus:ring-1 focus:ring-[#D01E1E] font-archivo"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isSignUp && (
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="h-11 px-4 pr-12 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-[#D01E1E] focus:ring-1 focus:ring-[#D01E1E] font-archivo"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={isSignUp ? formData.agreeToTerms : rememberMe}
                  onCheckedChange={(checked) => {
                    if (isSignUp) {
                      handleInputChange("agreeToTerms", checked === true);
                    } else {
                      setRememberMe(checked === true);
                    }
                  }}
                  className="border-gray-300"
                />
                <label htmlFor="remember" className="text-sm text-gray-700 font-archivo">
                  {isSignUp ? "I agree to the terms and conditions" : "Remember me"}
                </label>
              </div>
              {!isSignUp && (
                <Link to="/forgot-password" className="text-sm text-[#D01E1E] hover:underline font-archivo">
                  Forgot password?
                </Link>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#D01E1E] hover:bg-[#B01818] text-white font-semibold border-0 font-archivo"
            >
              {isSignUp ? "Create account" : "Sign in"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full h-12 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-archivo"
            >
              {isSignUp ? "Already have an account? Sign in" : "Create new account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
