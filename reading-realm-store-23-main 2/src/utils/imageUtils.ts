const API_BASE = (window as any)._env_?.API_BASE || 'https://backend-8zug.onrender.com/api';

/**
 * Get the appropriate cover image URL from a book object
 * Handles both new (coverImageUrl) and old (coverUrl) field names
 */
export const getCoverImageUrl = (book: any): string | null => {
  return book.coverImageUrl || book.coverUrl || null;
};

/**
 * Check if a book has a cover image
 */
export const hasCoverImage = (book: any): boolean => {
  const coverUrl = getCoverImageUrl(book);
  return !!coverUrl && coverUrl !== '/placeholder.svg';
};

/**
 * Get a fallback cover image URL
 */
export const getFallbackCoverUrl = (): string => {
  return '/placeholder.svg';
};

/**
 * Upload a book cover image to Cloudinary
 */
export const uploadBookCover = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('cover', file);
  
  const res = await fetch(`${API_BASE}/upload/book-cover`, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) {
    throw new Error('Failed to upload book cover');
  }
  
  const data = await res.json();
  // Return the secure_url from Cloudinary response
  return data.secure_url || data.url;
};

/**
 * Update a book cover image and delete the old one
 */
export const updateBookCover = async (file: File, oldCoverUrl?: string): Promise<string> => {
  const formData = new FormData();
  formData.append('cover', file);
  if (oldCoverUrl) {
    formData.append('oldCoverUrl', oldCoverUrl);
  }
  
  const res = await fetch(`${API_BASE}/upload/book-cover/update`, {
    method: 'PUT',
    body: formData,
  });
  
  if (!res.ok) {
    throw new Error('Failed to update book cover');
  }
  
  const data = await res.json();
  // Return the secure_url from Cloudinary response
  return data.secure_url || data.url;
}; 