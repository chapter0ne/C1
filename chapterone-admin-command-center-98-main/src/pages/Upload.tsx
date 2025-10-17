
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import UploadHeader from "@/components/upload/UploadHeader";
import UploadNavigation from "@/components/upload/UploadNavigation";
import UploadStepManager from "@/components/upload/UploadStepManager";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useUploadForm } from "@/hooks/useUploadForm";
import { useUploadValidation } from "@/hooks/useUploadValidation";
import { useUploadActions } from "@/components/upload/UploadActions";
import { api } from "@/utils/api";
import { uploadBookCover } from "@/utils/storage";

const Upload = () => {
  const { bookId } = useParams<{ bookId?: string }>();
  const navigate = useNavigate();
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
    selectedEpubFile,
    handleTagToggle,
    handleInputChange,
    handleChapterSave,
    handleChapterDelete,
    setInitialData,
    clearFormData,
    setSelectedTags,
    setChapters,
    setCoverImageUrl,
    handleEpubFileSelect
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

  // Set initial data for edit mode when data is fetched (only once)
  useEffect(() => {
    if (editBookData && editChapters && setInitialData && !isFormCleared) {
      console.log('Setting initial data - editBookData:', editBookData, 'editChapters:', editChapters);
      setInitialData(editBookData, editChapters);
      setIsLoadingBook(false); // Mark loading as complete
    }
  }, [editBookData, editChapters, isFormCleared]); // Removed setInitialData from dependencies

  const {
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStepAccessible
  } = useUploadValidation(formData, selectedTags, chapters, coverImageUrl, selectedEpubFile);

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
    console.log('handleSaveDraftWithData called with:', { formData, chapters, selectedTags });
    console.log('Current step:', currentStep);
    console.log('Form data keys:', Object.keys(formData));
    console.log('Form data values:', formData);
    handleSaveDraft(formData, chapters, selectedTags);
  };

  const handlePublishWithData = async () => {
    console.log('handlePublishWithData called with:', { formData, chapters, selectedTags, selectedEpubFile });
    
    // If there's an EPUB file selected, upload it first
    if (selectedEpubFile) {
      try {
        // Step 1: Upload cover image to Cloudinary if available
        let uploadedCoverUrl = null;
        
        // Check if we have a cover image file to upload
        if (formData.coverImage) {
          toast.info('Uploading cover image...');
          try {
            uploadedCoverUrl = await uploadBookCover(formData.coverImage);
            console.log('Cover image uploaded to Cloudinary:', uploadedCoverUrl);
          } catch (error) {
            console.error('Failed to upload cover image:', error);
            toast.error('Failed to upload cover image');
            return;
          }
        } else if (coverImageUrl && !coverImageUrl.startsWith('blob:')) {
          // Use existing Cloudinary URL if it's not a blob URL
          uploadedCoverUrl = coverImageUrl;
        }
        
        // Step 2: Upload EPUB with all metadata
        toast.info('Uploading EPUB file...');
        
        const formDataForUpload = new FormData();
        formDataForUpload.append('epub', selectedEpubFile);
        formDataForUpload.append('title', formData.title);
        formDataForUpload.append('author', formData.author);
        formDataForUpload.append('description', formData.description);
        formDataForUpload.append('genre', formData.genre);
        formDataForUpload.append('isbn', formData.isbn);
        formDataForUpload.append('price', formData.price);
        formDataForUpload.append('isFree', formData.isFree.toString());
        formDataForUpload.append('status', 'published');
        
        // Add tags as JSON string
        if (selectedTags && selectedTags.length > 0) {
          formDataForUpload.append('tags', JSON.stringify(selectedTags));
        }
        
        // Add cover image URL (from Cloudinary)
        if (uploadedCoverUrl) {
          formDataForUpload.append('coverImageUrl', uploadedCoverUrl);
        }
        
        console.log('Uploading EPUB with data:', {
          title: formData.title,
          author: formData.author,
          genre: formData.genre,
          tags: selectedTags,
          hasCoverImage: !!uploadedCoverUrl,
          coverImageUrl: uploadedCoverUrl
        });

        const token = localStorage.getItem('token');
        // Use local backend for EPUB uploads since the deployed backend doesn't have this endpoint yet
        const API_BASE = 'http://localhost:5000';
        
        const response = await fetch(`${API_BASE}/api/books/upload-epub`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataForUpload
        });

        if (response.ok) {
          const result = await response.json();
          toast.success('EPUB book published successfully!');
          navigate("/books");
          return;
        } else {
          throw new Error('EPUB upload failed');
        }
      } catch (error) {
        console.error('EPUB upload error:', error);
        toast.error('Failed to publish EPUB book');
        return;
      }
    }
    
    // Fall back to regular chapter-based publishing
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
      clearFormData(); // Clear current form data
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
          onStepNavigation={(stepNumber) => handleStepNavigation(stepNumber, Boolean(isStep1Valid()), Boolean(isStep2Valid()))}
          isStepAccessible={isStepAccessible}
          isStep1Valid={() => Boolean(isStep1Valid())}
          onEpubFileSelect={handleEpubFileSelect}
          selectedEpubFile={selectedEpubFile}
        />
        
        <UploadNavigation
          currentStep={currentStep}
          isStep1Valid={Boolean(isStep1Valid())}
          isStep2Valid={Boolean(isStep2Valid())}
          isStep3Valid={Boolean(isStep3Valid())}
          onNext={() => handleNext(Boolean(isStep1Valid()), Boolean(isStep2Valid()))}
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

