
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RichTextEditor from "./RichTextEditor";
import { Chapter } from "@/types/chapter";

interface ChapterEditorProps {
  onSave: (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  chapter?: Chapter;
}

const ChapterEditor = ({ onSave, onCancel, chapter }: ChapterEditorProps) => {
  const [title, setTitle] = useState(chapter?.title || "");
  const [content, setContent] = useState(chapter?.content || "");

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const chapterData = {
      title: title.trim(),
      content: content.trim(),
    };

    onSave(chapterData);
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    onCancel();
  };

  return (
    <div className="flex flex-col min-h-[600px]">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {chapter ? "Edit Chapter" : "Add New Chapter"}
        </h3>
      </div>
      
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="chapter-title">Chapter Title</Label>
                <Input
                  id="chapter-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter chapter title"
                  className="focus:border-black focus:ring-0"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1">
            <div className="h-full">
              <Label>Chapter Content</Label>
              <div className="mt-2 min-h-[400px]">
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your chapter content..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!title.trim() || !content.trim()}
          className="bg-black hover:bg-gray-800 text-white"
        >
          Save Chapter
        </Button>
      </div>
    </div>
  );
};

export default ChapterEditor;
