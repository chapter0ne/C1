
import React, { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useCreateBook } from "@/hooks/useBooks";
import { useUpdateBook } from "@/hooks/books/useCreateBook";
import { uploadBookCover } from "@/utils/storage";

export const useUploadActions = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId?: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createBookMutation = useCreateBook();
  const updateBookMutation = useUpdateBook();

  const isEditMode = !!bookId;

  // Add callback for form clearing - REMOVED as it was causing infinite re-renders
  // const [onFormClear, setOnFormClear] = useState<(() => void) | null>(null);

  // const setFormClearCallback = useCallback((callback: () => void) => {
  //   setOnFormClear(() => callback);
  // }, []);

  const handleNext = (isStep1Valid: boolean, isStep2Valid: boolean) => {
    if (currentStep === 1 && !isStep1Valid) {
      toast.error('Please fill in all required fields before continuing.');
      return;
    }
    if (currentStep === 2 && !isStep2Valid) {
      toast.error('Please add at least one chapter before continuing.');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async (formData: any, chapters: any[], selectedTags: string[]) => {
    // Prevent multiple submissions
    if (isSubmitting) {
      toast.error('Please wait, submission in progress...');
      return;
    }

    setIsSubmitting(true)
    try {
      let coverImageUrl = null;
      
      // Handle cover image: use new upload or preserve existing
      if (formData.coverImage) {
        // New cover image uploaded
        coverImageUrl = await uploadBookCover(formData.coverImage);
      } else if (isEditMode && formData.coverImageUrl) {
        // Preserve existing cover image when editing
        coverImageUrl = formData.coverImageUrl;
      }

      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        genre: formData.genre,
        isbn: formData.isbn,
        price: formData.isFree ? 0 : (formData.price ? Number(formData.price) : 0),
        isFree: !!formData.isFree,
        coverImageUrl: coverImageUrl,
        status: 'draft',
        tags: selectedTags,
        chapters: chapters.map((chapter) => ({
          title: chapter.title,
          content: chapter.content
        }))
      };

      if (isEditMode) {
        // Update existing book
        await updateBookMutation.mutateAsync({ id: bookId, ...bookData });
        toast.success('Book updated as draft!');
      } else {
        // Create new book
        await createBookMutation.mutateAsync(bookData);
        toast.success('Book saved as draft!');
      }

      // Navigate to books page after successful save
      navigate("/books");
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(isEditMode ? 'Failed to update draft' : 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (formData: any, chapters: any[], selectedTags: string[]) => {
    // Prevent multiple submissions
    if (isSubmitting) {
      toast.error('Please wait, submission in progress...');
      return;
    }

    setIsSubmitting(true);
    try {
      // Validation for publishing
      if (!formData.isFree && (!formData.price || Number(formData.price) <= 0)) {
        toast.error('Please set a price or mark the book as free before publishing.');
        return;
      }

      let coverImageUrl = null;
      
      // Handle cover image: use new upload or preserve existing
      if (formData.coverImage) {
        // New cover image uploaded
        coverImageUrl = await uploadBookCover(formData.coverImage);
      } else if (isEditMode && formData.coverImageUrl) {
        // Preserve existing cover image when editing
        coverImageUrl = formData.coverImageUrl;
      }

      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        genre: formData.genre,
        isbn: formData.isbn,
        price: formData.isFree ? 0 : (formData.price ? Number(formData.price) : 0),
        isFree: !!formData.isFree,
        coverImageUrl: coverImageUrl,
        status: 'published',
        tags: selectedTags,
        chapters: chapters.map((chapter) => ({
          title: chapter.title,
          content: chapter.content
        }))
      };

      if (isEditMode) {
        // Update existing book
        await updateBookMutation.mutateAsync({ id: bookId, ...bookData });
        toast.success('Book updated and published successfully!');
      } else {
        // Create new book
        await createBookMutation.mutateAsync(bookData);
        toast.success('Book published successfully!');
      }

      // Navigate to books page after successful publish
      navigate("/books");
    } catch (error) {
      console.error('Error publishing book:', error);
      toast.error(isEditMode ? 'Failed to update and publish book' : 'Failed to publish book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepNavigation = (stepNumber: number, isStep1Valid: boolean, isStep2Valid: boolean) => {
    if (stepNumber === 1) {
      setCurrentStep(1);
    } else if (stepNumber === 2 && isStep1Valid) {
      setCurrentStep(2);
    } else if (stepNumber === 3 && isStep1Valid && isStep2Valid) {
      setCurrentStep(3);
    }
  };

  return {
    currentStep,
    handleNext,
    handlePrevious,
    handleSaveDraft,
    handlePublish,
    handleStepNavigation,
    isLoading: createBookMutation.isPending || updateBookMutation.isPending || isSubmitting,
    isEditMode,
  };
};
