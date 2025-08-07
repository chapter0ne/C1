
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useReadingLists = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: readingLists = [], isLoading } = useQuery({
    queryKey: ['reading-lists', userId],
    queryFn: async () => {
      return await api.get('/reading-lists');
    },
    enabled: !!userId,
    // Return empty array if no userId
    initialData: [],
  });

  const createList = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      books: string[];
      isPublic: boolean;
    }) => {
      return await api.post('/reading-lists', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-lists', userId] });
    },
  });

  const updateList = useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      title?: string;
      description?: string;
      books?: string[];
      isPublic?: boolean;
    }) => {
      return await api.put(`/reading-lists/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-lists', userId] });
    },
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      return await api.del(`/reading-lists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-lists', userId] });
    },
  });

  const followList = useMutation({
    mutationFn: async (listId: string) => {
      return await api.post(`/reading-lists/${listId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-lists', userId] });
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ listId, content, parentComment }: {
      listId: string;
      content: string;
      parentComment?: string;
    }) => {
      return await api.post(`/reading-lists/${listId}/comments`, { content, parentComment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-lists', userId] });
    },
  });

  const getReadingList = async (listId: string) => {
    try {
      const response = await api.get(`/reading-lists/${listId}`);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const getReadingListComments = async (listId: string, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/reading-lists/${listId}/comments?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      return { comments: [], totalPages: 0, currentPage: 1, total: 0 };
    }
  };

  return { 
    readingLists, 
    isLoading, 
    createList, 
    updateList, 
    deleteList,
    followList,
    addComment,
    getReadingList,
    getReadingListComments
  };
};
