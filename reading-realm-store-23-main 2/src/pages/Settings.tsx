
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import MobileBottomNav from "@/components/MobileBottomNav";

const Settings = () => {
  const { user, updateProfile, logout } = useAuth();
  const { profile, loading } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isLibraryPublic, setIsLibraryPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        full_name: displayName,
        username: username,
        bio: bio
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D01E1E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#D01E1E] flex items-center justify-center rounded">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">ChapterOne</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-[#D01E1E] transition-colors">Home</Link>
              <Link to="/browse" className="text-gray-700 hover:text-[#D01E1E] transition-colors">Browse Books</Link>
              <Link to="/library" className="text-gray-700 hover:text-[#D01E1E] transition-colors">Library</Link>
              <Link to="/reading-lists" className="text-gray-700 hover:text-[#D01E1E] transition-colors">Reading Lists</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link to={`/profile/${user.id}`} className="flex items-center text-[#D01E1E] hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1"
                  placeholder="Your username"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="library-public">Public Library</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Allow others to see your book library and reading progress
                  </p>
                </div>
                <Switch
                  id="library-public"
                  checked={isLibraryPublic}
                  onCheckedChange={setIsLibraryPublic}
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Picture */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">
                    {displayName.charAt(0).toUpperCase() || username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <Button variant="outline" className="rounded-lg">
                  Change Picture
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Streak Information */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Reading Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="text-4xl">🍬</div>
                <div>
                  <p className="text-2xl font-bold">{profile?.streak_count || 0} days</p>
                  <p className="text-sm text-gray-500">Keep reading daily to maintain your streak!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings}
              className="bg-[#D01E1E] hover:bg-[#B01818] rounded-lg px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Settings;
