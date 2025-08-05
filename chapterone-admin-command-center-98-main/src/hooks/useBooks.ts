
// Re-export all book-related hooks and types from their respective files
export type { Book, BookWithChapters, CreateBookData } from '@/types/book';
export { usePublishedBooks as useBooks } from '@/hooks/books/usePublishedBooks';
export { useBookDetails } from '@/hooks/books/useBookDetails';
export { useCreateBook } from '@/hooks/books/useCreateBook';
export { useDeleteBook } from '@/hooks/books/useDeleteBook';
