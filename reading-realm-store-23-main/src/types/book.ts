
export interface Book {
  id: string;
  _id?: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  coverImageUrl: string; // Updated to match backend field name
  price: number;
  isFree: boolean;
  rating: number;
  totalRatings: number;
  chapters: Chapter[];
  tags: string[];
  // Additional properties for compatibility
  category?: string;
  cover?: string; // Keep for backward compatibility
  coverUrl?: string; // Keep for backward compatibility
  gradient?: string;
  fullDescription?: string;
  chapterCount?: number;
  reviewCount?: number;
  dateAdded?: string;
  isRecommended?: boolean;
  isTopRated?: boolean;
  pages?: number;
  language?: string;
  published?: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface ReadingList {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  bookIds: string[];
  followersCount: number;
  isPublic: boolean;
  createdAt: string;
  dateCreated?: string; // For compatibility
}

// Additional types for compatibility
export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserLibrary {
  id: string;
  userId: string;
  bookId: string;
  addedAt: string;
  progress: number;
  currentChapter: number;
  lastRead: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  bookId: string;
  addedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  streakCount: number;
  createdAt: string;
  updatedAt: string;
}
