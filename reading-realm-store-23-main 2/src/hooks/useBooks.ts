
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: async () => await api.get('/books'),
  });
};

export const useRandomBooks = (count: number = 24) => {
  return useQuery({
    queryKey: ['randomBooks', count],
    queryFn: async () => {
      const books = await api.get('/books');
      // Shuffle books to get random selection
      const shuffled = [...books].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    },
  });
};

export const useBookDetails = (id: string) => {
  return useQuery({
    queryKey: ['book', id],
    queryFn: async () => await api.get(`/books/${id}`),
    enabled: !!id,
  });
};

export const useBookChapters = (bookId: string) => {
  return useQuery({
    queryKey: ['bookChapters', bookId],
    queryFn: async () => {
      if (!bookId) return [];
      return await api.get(`/books/${bookId}/chapters`);
    },
    enabled: !!bookId,
  });
};

export const useSearchBooks = (params: { search?: string; category?: string; price?: string }) => {
  return useQuery({
    queryKey: ['searchBooks', params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.category && params.category !== 'All') query.append('category', params.category);
      if (params.price && params.price !== 'All') query.append('price', params.price);
      return await api.get(`/books?${query.toString()}`);
    },
  });
};
