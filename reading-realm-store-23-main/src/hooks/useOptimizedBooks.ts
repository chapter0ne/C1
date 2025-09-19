import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { api } from '@/utils/api';
import { Book } from '@/types/book';

// Debounce function for search
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Memoized book filtering and sorting
const useBookFilters = (books: Book[], filters: {
  search?: string;
  category?: string;
  price?: string;
  sortBy?: 'title' | 'author' | 'rating' | 'dateAdded';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useMemo(() => {
    if (!books || books.length === 0) return [];

    let filteredBooks = [...books];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        book.description.toLowerCase().includes(searchLower) ||
        book.genre.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'All') {
      filteredBooks = filteredBooks.filter(book => 
        book.genre === filters.category || book.category === filters.category
      );
    }

    // Apply price filter
    if (filters.price && filters.price !== 'All') {
      if (filters.price === 'Free') {
        filteredBooks = filteredBooks.filter(book => book.isFree);
      } else if (filters.price === 'Paid') {
        filteredBooks = filteredBooks.filter(book => !book.isFree);
      }
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredBooks.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filters.sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'author':
            aValue = a.author.toLowerCase();
            bValue = b.author.toLowerCase();
            break;
          case 'rating':
            aValue = a.rating || 0;
            bValue = b.rating || 0;
            break;
          case 'dateAdded':
            aValue = new Date(a.dateAdded || 0).getTime();
            bValue = new Date(b.dateAdded || 0).getTime();
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'desc') {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    return filteredBooks;
  }, [books, filters.search, filters.category, filters.price, filters.sortBy, filters.sortOrder]);
};

export const useOptimizedBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const result = await api.get('/books/public');
      return result || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
};

export const useOptimizedBookDetails = (id: string) => {
  return useQuery({
    queryKey: ['book', id],
    queryFn: async () => await api.get(`/books/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

export const useOptimizedBookChapters = (bookId: string) => {
  return useQuery({
    queryKey: ['bookChapters', bookId],
    queryFn: async () => {
      if (!bookId) return [];
      return await api.get(`/books/${bookId}/chapters`);
    },
    enabled: !!bookId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
};

export const useOptimizedSearchBooks = (params: { 
  search?: string; 
  category?: string; 
  price?: string;
  sortBy?: 'title' | 'author' | 'rating' | 'dateAdded';
  sortOrder?: 'asc' | 'desc';
}) => {
  const { data: allBooks = [] } = useOptimizedBooks();
  
  const filteredBooks = useBookFilters(allBooks, params);

  return {
    data: filteredBooks,
    isLoading: false,
    error: null,
    refetch: () => {},
  };
};

export const useInfiniteBooks = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['infiniteBooks'],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * pageSize;
      const result = await api.get(`/books/public?limit=${pageSize}&offset=${offset}`);
      return result || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useRandomBooks = (count: number = 24) => {
  const { data: allBooks = [] } = useOptimizedBooks();
  
  return useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];
    
    // Use Fisher-Yates shuffle for better randomization
    const shuffled = [...allBooks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }, [allBooks, count]);
};

// Debounced search hook
export const useDebouncedSearch = (callback: (searchTerm: string) => void, delay: number = 300) => {
  return useCallback(
    debounce(callback, delay),
    [callback, delay]
  );
};

