
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Chapter } from "@/types/chapter";

interface ChapterPreviewProps {
  chapter: Chapter;
  onEditChapter: (chapter: Chapter) => void;
}

const ChapterPreview = ({ chapter, onEditChapter }: ChapterPreviewProps) => {
  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="truncate">Chapter Preview: {chapter.title}</CardTitle>
          <Button
            onClick={() => onEditChapter(chapter)}
            className="bg-black hover:bg-gray-800 text-white flex-shrink-0"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Chapter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-6">
        <div 
          className="h-full overflow-y-auto break-words prose prose-sm max-w-none"
          style={{ 
            fontFamily: 'Georgia, serif', 
            lineHeight: '1.6'
          }}
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />
      </CardContent>
    </Card>
  );
};

export default ChapterPreview;
