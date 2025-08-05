
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Book } from "@/types/book";
import { Heart, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ReadingListCardProps {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  books: Book[];
  followersCount: number;
  showActions?: boolean;
}

const ReadingListCard = ({ 
  id, 
  name, 
  description, 
  creatorName, 
  books,
  followersCount,
  showActions = false
}: ReadingListCardProps) => {
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const firstBook = books[0];

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: `You are ${isFollowing ? "no longer following" : "now following"} this reading list.`,
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/reading-list/${id}`);
    toast({
      title: "Link Copied",
      description: "Reading list link copied to clipboard.",
    });
  };

  return (
    <Link to={`/reading-list/${id || _id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Book Image */}
            <div className="w-12 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {firstBook ? firstBook.title.charAt(0) : 'L'}
            </div>
            
            {/* List Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{name}</h3>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{description}</p>
              <p className="text-xs text-gray-500">by {creatorName} 🔥 5</p>
              <p className="text-xs text-gray-400">{followersCount} followers</p>
              
              {showActions && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant={isFollowing ? "outline" : "default"}
                    className={`flex-1 rounded-lg text-xs ${isFollowing ? "" : "bg-[#D01E1E] hover:bg-[#B01818]"}`}
                    onClick={handleFollow}
                  >
                    <Heart className={`w-3 h-3 mr-1 ${isFollowing ? "fill-current" : ""}`} />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-lg text-xs"
                    onClick={handleShare}
                  >
                    <Share className="w-3 h-3 mr-1" />
                    Share
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ReadingListCard;
