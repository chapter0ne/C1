
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
    setFormData({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      genre: book.genre || '',
      isbn: book.isbn || '',
      price: book.price ? String(book.price) : '',
      isFree: book.isFree ?? book.is_free ?? false,
      coverImage: undefined // You may want to handle cover image differently
    });
    setSelectedTags(book.tags || []);
    setChapters(chaptersData || []);
    // Optionally set coverImageUrl if you want to show the existing cover
    if (book.coverImageUrl || book.cover_image_url) {
      setCoverImageUrl(book.coverImageUrl || book.cover_image_url);
    }
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
    setInitialData
  };
};
