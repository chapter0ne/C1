
import { FormData } from "./useUploadForm";
import { Chapter } from "@/types/chapter";

export const useUploadValidation = (
  formData: FormData,
  selectedTags: string[],
  chapters: Chapter[]
) => {
  const isStep1Valid = () => {
    return formData.title.trim() !== '' && 
           formData.author.trim() !== '' && 
           formData.description.trim() !== '' && 
           formData.genre !== '' && 
           selectedTags.length > 0;
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
