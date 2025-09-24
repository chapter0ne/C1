
import StepIndicator from "./StepIndicator";
import BookDetailsStep from "./BookDetailsStep";
import BookContentStep from "./BookContentStep";
import PricingStep from "./PricingStep";
import { Chapter } from "@/types/chapter";

interface FormData {
  title: string;
  author: string;
  description: string;
  genre: string;
  isbn: string;
  price: string;
  isFree: boolean;
  coverImage?: File;
  coverImageUrl?: string; // Add this field for existing cover images
}

interface UploadStepManagerProps {
  currentStep: number;
  formData: FormData;
  selectedTags: string[];
  chapters: Chapter[];
  coverImageUrl: string | null;
  onInputChange: (field: string, value: string | boolean | File) => void;
  onTagToggle: (tag: string) => void;
  onChapterSave: (chapter: Chapter) => void;
  onChapterDelete: (chapterId: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onStepNavigation: (stepNumber: number) => void;
  isStepAccessible: (stepNumber: number) => boolean;
  isStep1Valid: () => boolean;
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

const UploadStepManager = ({
  currentStep,
  formData,
  selectedTags,
  chapters,
  coverImageUrl,
  onInputChange,
  onTagToggle,
  onChapterSave,
  onChapterDelete,
  onSaveDraft,
  onPublish,
  onStepNavigation,
  isStepAccessible,
  isStep1Valid
}: UploadStepManagerProps) => {
  const renderStepContent = () => {
    console.log('UploadStepManager renderStepContent - currentStep:', currentStep);
    console.log('UploadStepManager renderStepContent - formData:', formData);
    console.log('UploadStepManager renderStepContent - selectedTags:', selectedTags);
    console.log('UploadStepManager renderStepContent - chapters:', chapters);
    
    switch (currentStep) {
      case 1:
        return (
          <BookDetailsStep 
            formData={formData} 
            selectedTags={selectedTags} 
            coverImageUrl={coverImageUrl}
            onInputChange={onInputChange} 
            onTagToggle={onTagToggle} 
            isValid={isStep1Valid()} 
          />
        );
      case 2:
        return (
          <BookContentStep 
            chapters={chapters} 
            onChapterSave={onChapterSave} 
            onChapterDelete={onChapterDelete} 
            formData={formData} 
            coverImageUrl={coverImageUrl} 
          />
        );
      case 3:
        return (
          <PricingStep 
            formData={formData} 
            selectedTags={selectedTags} 
            onInputChange={onInputChange} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Step Indicator */}
      <div className="mb-6 overflow-x-auto">
        <StepIndicator 
          currentStep={currentStep} 
          steps={steps} 
          onStepClick={onStepNavigation}
          isStepAccessible={isStepAccessible}
        />
      </div>
      
      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>
    </>
  );
};

export default UploadStepManager;
