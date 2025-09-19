import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

export const useLibraryMutations = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addToLibrary = useMutation({
    mutationFn: async (bookId: string) => {
      const response = await api.post('/user-library', { bookId });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLibrary', userId] });
      toast({
        title: "Added to Library",
        description: "Book has been added to your library.",
      });
    },
    onError: (error) => {
      console.error('Add to library error:', error);
      toast({
        title: "Error",
        description: "Failed to add book to library. Please try again.",
        variant: "destructive"
      });
    },
  });

  const removeFromLibrary = useMutation({
    mutationFn: async (bookId: string) => {
      // First check if the book is purchased or is a paid book
      const userLibrary = (queryClient.getQueryData(['userLibrary', userId]) as any[]) || [];
      const libraryEntry = userLibrary.find((entry: any) => 
        (entry.book?._id || entry.book?.id || entry._id || entry.id) === bookId
      );
      
      if (!libraryEntry) {
        throw new Error('Book not found in library');
      }
      
      const book = libraryEntry.book || libraryEntry;
      const isPaidBook = !(book?.isFree === true || book?.is_free === true || book?.price === 0 || book?.price === '0' || book?.price === undefined || book?.price === null);
      const isPurchased = libraryEntry?.isPurchased || libraryEntry?.purchased || false;
      
      // Also check if book was ever purchased (even if not currently in library)
      let wasEverPurchased = false;
      try {
        const purchaseHistory = await api.get(`/purchases/user/${userId}?bookId=${bookId}`);
        wasEverPurchased = purchaseHistory && purchaseHistory.length > 0;
      } catch (error) {
        console.error('Failed to check purchase history:', error);
      }
      
      if (isPaidBook || isPurchased || wasEverPurchased) {
        throw new Error('Cannot remove paid books from library');
      }
      
      const response = await api.del(`/user-library/${bookId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLibrary', userId] });
      toast({
        title: "Removed from Library",
        description: "Book has been removed from your library.",
      });
    },
    onError: (error) => {
      console.error('Remove from library error:', error);
      if (error.message === 'Cannot remove paid books from library') {
        toast({
          title: "Cannot Remove",
          description: "Paid books cannot be removed from your library.",
          variant: "destructive"
        });
      } else if (error.message === 'Book not found in library') {
        toast({
          title: "Error",
          description: "Book not found in your library.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove book from library. Please try again.",
          variant: "destructive"
        });
      }
    },
  });

  return {
    addToLibrary,
    removeFromLibrary,
  };
};
