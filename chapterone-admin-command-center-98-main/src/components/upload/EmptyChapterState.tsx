
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyChapterStateProps {
  onCreateNew: () => void;
}

const EmptyChapterState = ({ onCreateNew }: EmptyChapterStateProps) => {
  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Chapter Editor</CardTitle>
        <p className="text-sm text-gray-600">Select a chapter to view or create a new one</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center text-center min-h-0">
        <p className="text-gray-500 mb-4">No chapter selected</p>
        <Button 
          variant="outline"
          onClick={onCreateNew}
        >
          + Create New Chapter
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyChapterState;
