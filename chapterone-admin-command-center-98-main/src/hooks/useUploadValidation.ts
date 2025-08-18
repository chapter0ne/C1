
import { FormData } from "./useUploadForm";
import { Chapter } from "@/types/chapter";

export const useUploadValidation = (
  formData: FormData,
  selectedTags: string[],
  chapters: Chapter[],
  coverImageUrl?: string | null // Add coverImageUrl parameter
) => {
  const isStep1Valid = () => {
    // Check if we have either a new cover image or an existing cover image URL
    const hasCoverImage = formData.coverImage || coverImageUrl;
    
    return formData.title.trim() !== '' && 
           formData.author.trim() !== '' && 
           formData.description.trim() !== '' && 
           formData.genre !== '' && 
           selectedTags.length > 0 &&
           hasCoverImage; // Add cover image requirement
  };

  const isStep2Valid = () => {
    return chapters.length > 0;
  };

  const isStepAccessible = (stepNumber: number) => {
    if (stepNumber === 1) return true;
    if (stepNumber === 2) return isStep1Valid();
    if (stepNumber === 3) return isStep1Valid() && isStep2Valid();
    return false;
  };

  return {
    isStep1Valid,
    isStep2Valid,
    isStepAccessible
  };
};
