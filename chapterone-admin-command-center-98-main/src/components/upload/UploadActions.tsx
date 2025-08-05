
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateBook } from "@/hooks/useBooks";
import { uploadBookCover } from "@/utils/storage";

export const useUploadActions = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const createBookMutation = useCreateBook();

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
    try {
      let coverImageUrl = null;
      if (formData.coverImage) {
        coverImageUrl = await uploadBookCover(formData.coverImage);
      }

      await createBookMutation.mutateAsync({
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
      });

      toast.success('Book saved as draft!');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  };

  const handlePublish = async (formData: any, chapters: any[], selectedTags: string[]) => {
    try {
      // Validation for publishing
      if (!formData.isFree && (!formData.price || Number(formData.price) <= 0)) {
        toast.error('Please set a price or mark the book as free before publishing.');
        return;
      }

      let coverImageUrl = null;
      if (formData.coverImage) {
        coverImageUrl = await uploadBookCover(formData.coverImage);
      }

      await createBookMutation.mutateAsync({
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
      });

      toast.success('Book published successfully!');
      navigate("/books");
    } catch (error) {
      console.error('Error publishing book:', error);
      toast.error('Failed to publish book');
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
    isLoading: createBookMutation.isPending
  };
};
