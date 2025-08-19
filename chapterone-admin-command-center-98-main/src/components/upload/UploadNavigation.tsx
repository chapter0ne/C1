
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Upload, Loader2 } from "lucide-react";

interface UploadNavigationProps {
  currentStep: number;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  isStep3Valid: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isLoading?: boolean;
}

const UploadNavigation = ({ 
  currentStep, 
  isStep1Valid, 
  isStep2Valid, 
  isStep3Valid,
  onNext, 
  onPrevious, 
  onSaveDraft, 
  onPublish,
  isLoading = false
}: UploadNavigationProps) => {
  const canGoNext = (currentStep === 1 && isStep1Valid) || (currentStep === 2 && isStep2Valid);
  const showNextButton = currentStep < 3;
  const showPublishButton = currentStep === 3;

  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
      <div className="flex space-x-2">
        {currentStep > 1 && (
          <Button 
            variant="outline" 
            onClick={onPrevious}
            disabled={isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        )}
      </div>

      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onSaveDraft}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Draft
        </Button>

        {showNextButton && (
          <Button 
            onClick={onNext} 
            disabled={!canGoNext || isLoading}
            className="bg-black hover:bg-gray-800 text-white"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {showPublishButton && (
          <Button 
            onClick={onPublish}
            disabled={!isStep1Valid || !isStep2Valid || !isStep3Valid || isLoading}
            className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Publish Book
          </Button>
        )}
      </div>
    </div>
  );
};

export default UploadNavigation;
