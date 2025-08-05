
export interface Book {
  id: string;
  _id?: string;
  title: string;
  author: string;
  description: string | null;
  genre: string | null;
  isbn: string | null;
  price: number | null;
  is_free: boolean;
  cover_image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookWithChapters extends Book {
  chapters: Array<{
    id: string;
    _id?: string;
    title: string;
    content: string;
    chapter_order: number;
  }>;
  purchase_count?: number;
  library_count?: number;
}

export interface CreateBookData {
  title: string;
  author: string;
  description: string;
  genre: string;
  isbn?: string;
  price?: number;
  is_free: boolean;
  cover_image_url?: string;
  status: 'draft' | 'published';
  tags: string[];
  chapters: Array<{ title: string; content: string; chapter_order: number }>;
}
