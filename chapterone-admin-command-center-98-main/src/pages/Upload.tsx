
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
  const [bookLoadError, setBookLoadError] = useState<string | null>(null);
  const [isFormCleared, setIsFormCleared] = useState(false);

  const {
    formData,
    selectedTags,
    chapters,
    coverImageUrl,
    handleTagToggle,
    handleInputChange,
    handleChapterSave,
    handleChapterDelete,
    setInitialData,
    clearFormData,
    setSelectedTags,
    setChapters,
    setCoverImageUrl
  } = useUploadForm();

  // Fetch book and chapters if editing
  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId || isLoadingBook) return; // Prevent multiple calls
      setIsLoadingBook(true);
      try {
        
        // Show progress for slow backend
        toast.info('Fetching book data... This may take a while due to slow backend.');
        
        const book = await api.get(`/books/${bookId}`);
        
        toast.info('Book data loaded, now fetching chapters...');
        const chapters = await api.get(`/chapters?bookId=${bookId}`);
        
        setEditBookData(book);
        setEditChapters(chapters);
        setBookLoadError(null); // Clear any previous errors
        
        toast.success('Book data loaded successfully!');
      } catch (e) {
        console.error('Error fetching book:', e);
        let errorMessage = 'Failed to load book for editing';
        
        if (e instanceof Error) {
          if (e.message.includes('timeout')) {
            errorMessage = 'Book loading timed out - the backend is very slow. Please try again.';
          } else if (e.message.includes('network')) {
            errorMessage = 'Network error - please check your connection and try again.';
          } else {
            errorMessage = e.message;
          }
        }
        
        setBookLoadError(errorMessage);
        toast.error(errorMessage);
        setIsLoadingBook(false); // Reset loading state on error
      }
    };
    
    // Only fetch if we have a bookId and we're not already loading
    if (bookId && !isLoadingBook) {
      fetchBook();
    }
  }, [bookId]); // Remove setInitialData and isLoadingBook from dependencies

  // Set initial data for edit mode when data is fetched
  useEffect(() => {
    if (editBookData && editChapters && setInitialData && !isFormCleared) {
      setInitialData(editBookData, editChapters);
      setIsLoadingBook(false); // Mark loading as complete
    }
  }, [editBookData, editChapters, setInitialData, isFormCleared]);

  const {
    isStep1Valid,
    isStep2Valid,
    isStepAccessible
  } = useUploadValidation(formData, selectedTags, chapters, coverImageUrl);

  const {
    currentStep,
    handleNext,
    handlePrevious,
    handleSaveDraft,
    handlePublish,
    handleStepNavigation,
    isLoading,
    isEditMode
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

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
      clearFormData();
      setIsFormCleared(true); // Set flag to prevent repopulation
      toast.success('Form cleared successfully!');
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to restore the original book data? This will overwrite any changes you have made.')) {
      setIsFormCleared(false); // Allow repopulation
      // The useEffect will automatically repopulate the form
      toast.success('Form reset to original book data!');
    }
  };

  if (isLoadingBook) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8 text-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <div>Loading book for editing...</div>
            <div className="text-sm text-gray-500 mt-2">The backend is slow, this may take up to 30 seconds</div>
            <div className="text-xs text-gray-400 mt-1">Please be patient while we fetch your book data</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (bookLoadError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8 text-lg">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️ Error Loading Book</div>
            <div className="text-gray-700 mb-4">{bookLoadError}</div>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => {
                  setBookLoadError(null);
                  setIsLoadingBook(false);
                  // Retry loading
                  if (bookId) {
                    setEditBookData(null);
                    setEditChapters([]);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
              {bookLoadError.includes('timeout') && (
                <button 
                  onClick={() => {
                    setBookLoadError(null);
                    setIsLoadingBook(false);
                    // Force a fresh retry
                    if (bookId) {
                      setEditBookData(null);
                      setEditChapters([]);
                      setIsFormCleared(false);
                    }
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Force Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <UploadHeader 
          currentStep={currentStep} 
          onShowDrafts={() => {}} 
          onClearForm={handleClearForm}
          onResetForm={handleResetForm}
          isEditMode={isEditMode}
        />
        
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

