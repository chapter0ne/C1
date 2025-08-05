
import { useReadingLists } from './useReadingLists';

export const useReadingListStore = (userId: string) => {
  const { readingLists, isLoading, createList, updateList, deleteList } = useReadingLists(userId);

  const featuredLists = readingLists.filter((list: any) => list.followersCount > 200);
  const popularLists = [...readingLists].sort((a: any, b: any) => b.followersCount - a.followersCount).slice(0, 3);

  return {
    readingLists,
    featuredLists,
    popularLists,
    isLoading,
    createList,
    updateList,
    deleteList,
  };
};
