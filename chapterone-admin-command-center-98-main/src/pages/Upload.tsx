
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import UploadHeader from "@/components/upload/UploadHeader";
import UploadNavigation from "@/components/upload/UploadNavigation";
import UploadStepManager from "@/components/upload/UploadStepManager";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useUploadForm } from "@/hooks/useUploadForm";
import { useUploadValidation } from "@/hooks/useUploadValidation";
import { useUploadActions } from "@/components/upload/UploadActions";
import { api } from "@/utils/api";

const Upload = () => {
  const { bookId } = useParams<{ bookId?: string }>();
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [editBookData, setEditBookData] = useState<any>(null);
  const [editChapters, setEditChapters] = useState<any[]>([]);

  // Fetch book and chapters if editing
  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      setIsLoadingBook(true);
      try {
        const book = await api.get(`/books/${bookId}`);
        const chapters = await api.get(`/chapters?bookId=${bookId}`);
        setEditBookData(book);
        setEditChapters(chapters);
      } catch (e) {
        toast.error('Failed to load book for editing');
      } finally {
        setIsLoadingBook(false);
      }
    };
    fetchBook();
  }, [bookId]);

  const {
    formData,
    selectedTags,
    chapters,
    coverImageUrl,
    handleTagToggle,
    handleInputChange,
    handleChapterSave,
    handleChapterDelete,
    setInitialData // <-- add this to useUploadForm
  } = useUploadForm();

  // Set initial data for edit mode
  useEffect(() => {
    if (editBookData && setInitialData) {
      setInitialData(editBookData, editChapters);
    }
  }, [editBookData, editChapters, setInitialData]);

  const {
    isStep1Valid,
    isStep2Valid,
    isStepAccessible
  } = useUploadValidation(formData, selectedTags, chapters);

  const {
    currentStep,
    handleNext,
    handlePrevious,
    handleSaveDraft,
    handlePublish,
    handleStepNavigation,
    isLoading
  } = useUploadActions();

  const handleChapterSaveWithToast = (chapter: any) => {
    handleChapterSave(chapter);
    toast.success('Chapter saved successfully!');
  };

  const handleChapterDeleteWithToast = (chapterId: string) => {
    handleChapterDelete(chapterId);
    toast.success('Chapter deleted successfully!');
  };

  const handleSaveDraftWithData = () => {
    handleSaveDraft(formData, chapters, selectedTags);
  };

  const handlePublishWithData = () => {
    handlePublish(formData, chapters, selectedTags);
  };

  if (isLoadingBook) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8 text-lg">Loading book for editing...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <UploadHeader currentStep={currentStep} onShowDrafts={() => {}} />
        
        <UploadStepManager
          currentStep={currentStep}
          formData={formData}
          selectedTags={selectedTags}
          chapters={chapters}
          coverImageUrl={coverImageUrl}
          onInputChange={handleInputChange}
          onTagToggle={handleTagToggle}
          onChapterSave={handleChapterSaveWithToast}
          onChapterDelete={handleChapterDeleteWithToast}
          onSaveDraft={handleSaveDraftWithData}
          onPublish={handlePublishWithData}
          onStepNavigation={(stepNumber) => handleStepNavigation(stepNumber, isStep1Valid(), isStep2Valid())}
          isStepAccessible={isStepAccessible}
          isStep1Valid={isStep1Valid}
        />
        
        <UploadNavigation
          currentStep={currentStep}
          isStep1Valid={isStep1Valid()}
          isStep2Valid={isStep2Valid()}
          onNext={() => handleNext(isStep1Valid(), isStep2Valid())}
          onPrevious={handlePrevious}
          onSaveDraft={handleSaveDraftWithData}
          onPublish={handlePublishWithData}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default Upload;
