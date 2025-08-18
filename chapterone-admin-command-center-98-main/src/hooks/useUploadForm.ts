
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
}

export const useUploadForm = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChapterSave = (chapter: Chapter) => {
    setChapters(prev => {
      const existing = prev.find(c => c.id === chapter.id);
      if (existing) {
        return prev.map(c => c.id === chapter.id ? chapter : c);
      }
      return [...prev, chapter];
    });
  };

  const handleChapterDelete = (chapterId: string) => {
    setChapters(prev => prev.filter(c => c.id !== chapterId));
  };

  const setInitialData = (book: any, chaptersData: any[]) => {
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
    
    setFormData({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      genre: book.genre || '',
      isbn: book.isbn || '',
      price: book.price ? String(book.price) : '',
      isFree: book.isFree ?? book.is_free ?? false,
      coverImage: undefined // Keep as undefined for new file uploads
    });
    
    setSelectedTags(tags);
    setChapters(chapters);
    
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
      coverImage: undefined
    });
    setSelectedTags([]);
    setChapters([]);
    setCoverImageUrl(null);
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
