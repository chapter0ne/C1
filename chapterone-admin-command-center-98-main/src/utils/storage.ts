import { API_BASE } from './api';

export async function uploadBookCover(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('cover', file);
  const res = await fetch(`${API_BASE}/api/upload/book-cover`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw new Error('Failed to upload book cover');
  }
  const data = await res.json();
  // Return the secure_url from Cloudinary response
  return data.secure_url || data.url;
}

export async function updateBookCover(file: File, oldCoverUrl?: string): Promise<string> {
  const formData = new FormData();
  formData.append('cover', file);
  if (oldCoverUrl) {
    formData.append('oldCoverUrl', oldCoverUrl);
  }
  
  const res = await fetch(`${API_BASE}/api/upload/book-cover/update`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) {
    throw new Error('Failed to update book cover');
  }
  const data = await res.json();
  // Return the secure_url from Cloudinary response
  return data.secure_url || data.url;
}
