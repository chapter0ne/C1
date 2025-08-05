
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Loader2 } from "lucide-react";

const DashboardHeader = () => {
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with Chapter One.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </div>
      </header>
    );
  }

  const profile = dashboardData?.currentUserProfile;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with Chapter One.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {profile?.full_name || profile?.username || 'Admin'}
            </p>
            <p className="text-xs text-gray-500">
              {profile?.email || 'admin@chapterone.com'}
            </p>
          </div>
          <Avatar>
            <AvatarImage src={profile?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"} />
            <AvatarFallback>
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
