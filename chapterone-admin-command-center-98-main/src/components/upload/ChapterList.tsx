
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Chapter } from "@/types/chapter";

interface ChapterListProps {
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  onChapterSelect: (chapter: Chapter) => void;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapterId: string) => void;
  onShowPreview: () => void;
  onCreateNew: () => void;
}

const ChapterList = ({
  chapters,
  selectedChapter,
  onChapterSelect,
  onEditChapter,
  onDeleteChapter,
  onShowPreview,
  onCreateNew
}: ChapterListProps) => {
  return (
    <Card className="flex-1 flex flex-col min-h-0">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chapters</CardTitle>
            <p className="text-sm text-gray-600">Manage chapters</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onShowPreview}
            disabled={chapters.length === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
          {chapters.map((chapter, index) => (
            <div 
              key={chapter._id || chapter.id} 
              className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedChapter?._id === chapter._id || selectedChapter?.id === chapter.id ? 'border-black bg-gray-50' : ''
              }`}
              onClick={() => {
                console.log('Chapter selected:', chapter.title, 'Content length:', chapter.content.length);
                onChapterSelect(chapter);
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{chapter.title}</p>
                <p className="text-sm text-gray-600">
                  Chapter {index + 1}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditChapter(chapter);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChapter(chapter._id || chapter.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button 
          className="w-full bg-black hover:bg-gray-800 text-white mt-4 flex-shrink-0"
          onClick={onCreateNew}
        >
          + Add Chapter
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChapterList;
