
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface UploadHeaderProps {
  currentStep: number;
  onShowDrafts: () => void;
}

const steps = [{
  number: 1,
  title: "Book Details",
  description: "Basic information"
}, {
  number: 2,
  title: "Book Content",
  description: "Chapters and content"
}, {
  number: 3,
  title: "Pricing",
  description: "Set price and publish"
}];

const UploadHeader = ({ currentStep, onShowDrafts }: UploadHeaderProps) => {
  const draftCount = 0; // Removed draft functionality

  return (
    <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 px-0 my-[13px]">Upload Book</h2>
        <p className="text-gray-600">
          Step {currentStep} of 3 - {steps[currentStep - 1].description}
        </p>
      </div>
      <Button variant="outline" onClick={onShowDrafts} className="flex items-center gap-2 flex-shrink-0 relative">
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">View Drafts</span>
        <span className="sm:hidden">Drafts</span>
        {draftCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {draftCount}
          </span>
        )}
      </Button>
    </div>
  );
};

export default UploadHeader;
