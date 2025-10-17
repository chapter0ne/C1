
import { FormData } from "./useUploadForm";
import { Chapter } from "@/types/chapter";

export const useUploadValidation = (
  formData: FormData,
  selectedTags: string[],
  chapters: Chapter[],
  coverImageUrl?: string | null, // Add coverImageUrl parameter
  selectedEpubFile?: File | null // Add selectedEpubFile parameter
) => {
  const isStep1Valid = () => {
    // Check if we have either a new cover image or an existing cover image URL
    const hasCoverImage = formData.coverImage || coverImageUrl;
    
    // Basic required fields only (no pricing validation in step 1)
    const isValid = formData.title.trim() !== '' && 
           formData.author.trim() !== '' && 
           formData.description.trim() !== '' && 
           formData.genre !== '' && 
           selectedTags.length > 0 &&
           hasCoverImage;
    
    console.log('isStep1Valid check:', {
      title: formData.title.trim() !== '',
      author: formData.author.trim() !== '',
      description: formData.description.trim() !== '',
      genre: formData.genre !== '',
      tags: selectedTags.length > 0,
      hasCoverImage,
      isValid
    });
    
    return isValid;
  };

  const isStep2Valid = () => {
    // Step 2 is valid if either chapters exist OR an EPUB file has been selected
    const isValid = chapters.length > 0 || selectedEpubFile !== null;
    console.log('isStep2Valid check:', { 
      chaptersLength: chapters.length, 
      selectedEpubFile: selectedEpubFile?.name, 
      isValid 
    });
    return isValid;
  };

  const isStep3Valid = () => {
    // Pricing validation for step 3
    const priceNumber = Number(formData.price) || 0;
    const isValid = formData.isFree || (formData.price && priceNumber > 0);
    console.log('isStep3Valid check:', { 
      isFree: formData.isFree, 
      price: formData.price, 
      priceNumber: priceNumber, 
      isValid 
    });
    return isValid;
  };

  const isStepAccessible = (stepNumber: number): boolean => {
    if (stepNumber === 1) return true;
    if (stepNumber === 2) return Boolean(isStep1Valid());
    if (stepNumber === 3) return Boolean(isStep1Valid()) && Boolean(isStep2Valid());
    return false;
  };

  return {
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStepAccessible
  };
};
