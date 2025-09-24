
import { useState, useEffect } from "react";
import { Chapter } from "@/types/chapter";

export interface FormData {
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

export const useUploadForm = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [initialDataSet, setInitialDataSet] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    author: "",
    description: "",
    genre: "",
    isbn: "",
    price: "",
    isFree: false,
    coverImage: undefined
  });

  // Update cover image URL when cover image changes
  useEffect(() => {
    if (formData.coverImage) {
      const url = URL.createObjectURL(formData.coverImage);
      setCoverImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCoverImageUrl(null);
    }
  }, [formData.coverImage]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleInputChange = (field: string, value: string | boolean | File) => {
    console.log('handleInputChange called with:', { field, value });
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };
      console.log('Updated formData:', newFormData);
      return newFormData;
    });
  };

  const handleChapterSave = (chapter: Chapter) => {
    console.log('handleChapterSave called with chapter:', chapter);
    setChapters(prev => {
      const existing = prev.find(c => c.id === chapter.id);
      const newChapters = existing 
        ? prev.map(c => c.id === chapter.id ? chapter : c)
        : [...prev, chapter];
      console.log('Updated chapters:', newChapters);
      return newChapters;
    });
  };

  const handleChapterDelete = (chapterId: string) => {
    console.log('handleChapterDelete called with chapterId:', chapterId);
    setChapters(prev => {
      const newChapters = prev.filter(c => c.id !== chapterId);
      console.log('Chapters after deletion:', newChapters);
      return newChapters;
    });
  };

  const setInitialData = (book: any, chaptersData: any[]) => {
    console.log('setInitialData called with:', { book, chaptersData, initialDataSet });
    
    // Prevent multiple calls to setInitialData
    if (initialDataSet) {
      console.log('setInitialData already called, skipping...');
      return;
    }
    
    // Handle cover image - preserve existing image URL
    const existingCoverUrl = book.coverImageUrl || book.cover_image_url || book.coverImage || book.cover_image;
    
    // Try to find tags in multiple possible fields
    let tags = book.tags || book.genres || book.categories || [];
    
    // Handle single genre field (backend stores as single string)
    if (!tags || tags.length === 0) {
      if (book.genre && typeof book.genre === 'string') {
        tags = [book.genre];
      }
    }
    
    // If tags is a string, split it into an array
    if (typeof tags === 'string') {
      tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    
    // Ensure tags is an array
    if (!Array.isArray(tags)) {
      tags = [];
    }
    
    // Ensure chapters is an array
    let chapters = chaptersData || [];
    if (!Array.isArray(chapters)) {
      chapters = [];
    }
    
    const newFormData = {
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      genre: book.genre || '',
      isbn: book.isbn || '',
      price: book.price ? String(book.price) : (book.isFree || book.is_free ? '0' : '1000'), // Default to 0 for free books, 1000 for paid
      isFree: book.isFree ?? book.is_free ?? false,
      coverImage: undefined, // Keep as undefined for new file uploads
      coverImageUrl: existingCoverUrl || undefined // Set existing cover URL
    };
    
    console.log('Setting new form data:', newFormData);
    console.log('Setting tags:', tags);
    console.log('Setting chapters:', chapters);
    console.log('Setting cover image URL:', existingCoverUrl);
    
    setFormData(newFormData);
    setSelectedTags(tags);
    setChapters(chapters);
    setInitialDataSet(true); // Mark that initial data has been set
    
    // Set cover image URL to show existing image
    if (existingCoverUrl) {
      setCoverImageUrl(existingCoverUrl);
    } else {
      setCoverImageUrl(null);
    }
  };

  const clearFormData = () => {
    setFormData({
      title: "",
      author: "",
      description: "",
      genre: "",
      isbn: "",
      price: "",
      isFree: false,
      coverImage: undefined,
      coverImageUrl: undefined
    });
    setSelectedTags([]);
    setChapters([]);
    setCoverImageUrl(null);
    setInitialDataSet(false); // Reset the flag when clearing form
  };

  return {
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
  };
};
