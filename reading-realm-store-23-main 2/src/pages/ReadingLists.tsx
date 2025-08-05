
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReadingLists } from "@/hooks/useReadingLists";
import { useUserLibrary } from "@/hooks/useUserLibrary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Heart, Share, MessageCircle, BookOpen, Users } from "lucide-react";
import UniversalHeader from "@/components/UniversalHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import ReadingListCard from "@/components/ReadingListCard";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useBooks } from '@/hooks/useBooks';
import { useCart } from '@/hooks/useCart';

const ReadingLists = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'following'>('all');
  
  const { readingLists, isLoading, createList, updateList, deleteList } = useReadingLists(user?.id || '');
  const { data: allBooks = [] } = useBooks();
  const { data: userLibrary = [] } = useUserLibrary(user?.id || '');
  const { cart, addToCart } = useCart(user?.id || '');

  // Add state for selected books
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [bookTab, setBookTab] = useState<'library' | 'find'>('library');
  const [searchBookTerm, setSearchBookTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Helper: get books from user's library (extract book objects from library entries)
  const libraryBooks = userLibrary.map((entry: any) => entry.book || entry);

  // Handle book selection
  const handleBookSelect = (bookId: string, checked: boolean) => {
    setSelectedBooks(prev => checked ? [...prev, bookId] : prev.filter(id => id !== bookId));
  };

  // On search in 'Find More Books' tab
  const handleSearchBooks = () => {
    setSearchResults(allBooks.filter(b =>
      b.title.toLowerCase().includes(searchBookTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchBookTerm.toLowerCase())
    ));
  };

  // Form state for creating new list
  const [newListData, setNewListData] = useState({
    title: '',
    description: '',
    isPublic: true
  });

  // Filter reading lists based on search and active tab
  const filteredLists = readingLists.filter((list: any) => {
    const matchesSearch = list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         list.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'my') {
      return matchesSearch && list.creator === user?.id;
    } else if (activeTab === 'following') {
      return matchesSearch && list.followers?.includes(user?.id);
    }
    
    return matchesSearch;
  });

  // Update handleCreateList to require at least one book
  const handleCreateList = async () => {
    if (!newListData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your reading list.",
        variant: "destructive"
      });
      return;
    }
    if (selectedBooks.length === 0) {
      toast({
        title: "No Books Selected",
        description: "Please select at least one book for your list.",
        variant: "destructive"
      });
      return;
    }
    try {
      await createList.mutateAsync({
        title: newListData.title.trim(),
        description: newListData.description.trim(),
        books: selectedBooks,
        isPublic: newListData.isPublic
      });
      toast({
        title: "List Created!",
        description: "Your reading list has been created successfully.",
      });
      setNewListData({ title: '', description: '', isPublic: true });
      setSelectedBooks([]);
      setShowCreateDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reading list. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFollow = async (listId: string) => {
    try {
      // This would need to be implemented in the backend
      toast({
        title: "Following",
        description: "You are now following this reading list.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow reading list.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (listId: string) => {
    try {
      const url = `${window.location.origin}/reading-list/${listId}`;
      await navigator.clipboard.writeText(url);
        toast({
        title: "Link Copied",
        description: "Reading list link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <UniversalHeader currentPage="reading-lists" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D01E1E] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reading lists...</p>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UniversalHeader currentPage="reading-lists" />

      <div className="flex-1 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Reading Lists</h1>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#D01E1E] hover:bg-[#B01818]">
              <Plus className="w-4 h-4 mr-2" />
              Create List
            </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Reading List</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <Input
                        placeholder="Enter list title..."
                        value={newListData.title}
                        onChange={(e) => setNewListData({ ...newListData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea
                        placeholder="Describe your reading list..."
                        value={newListData.description}
                        onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={newListData.isPublic}
                        onChange={(e) => setNewListData({ ...newListData, isPublic: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="isPublic" className="text-sm text-gray-700">
                        Make this list public
                      </label>
                    </div>
                    {/* Add book selection UI */}
                    <div className="pt-2">
                      <Tabs value={bookTab} onValueChange={(value) => setBookTab(value as 'library' | 'find')} className="w-full mb-2">
                        <TabsList className="w-full grid grid-cols-2 mb-2">
                          <TabsTrigger value="library">My Library</TabsTrigger>
                          <TabsTrigger value="find">Find More Books</TabsTrigger>
                        </TabsList>
                        <TabsContent value="library">
                          <div className="max-h-48 overflow-y-auto">
                            {libraryBooks.map((book: any) => (
                              <label key={book._id || book.id} className="flex items-center gap-2 py-1">
                                <input
                                  type="checkbox"
                                  checked={selectedBooks.includes(book._id || book.id)}
                                  onChange={e => handleBookSelect(book._id || book.id, e.target.checked)}
                                />
                                <span className="flex-1 truncate">{book.title} <span className="text-xs text-gray-400">by {book.author}</span></span>
                              </label>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="find">
                          <div className="mb-2 flex gap-2">
                            <Input
                              placeholder="Search all books..."
                              value={searchBookTerm}
                              onChange={e => setSearchBookTerm(e.target.value)}
                              className="flex-1"
                            />
                            <Button onClick={handleSearchBooks} size="sm">Search</Button>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {searchResults.map((book: any) => (
                              <label key={book._id || book.id} className="flex items-center gap-2 py-1">
                                <input
                                  type="checkbox"
                                  checked={selectedBooks.includes(book._id || book.id)}
                                  onChange={e => handleBookSelect(book._id || book.id, e.target.checked)}
                                />
                                <span className="flex-1 truncate">{book.title} <span className="text-xs text-gray-400">by {book.author}</span></span>
                              </label>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
        </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleCreateList}
                        className="flex-1 bg-[#D01E1E] hover:bg-[#B01818]"
                        disabled={createList.isPending}
                      >
                        {createList.isPending ? 'Creating...' : 'Create List'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-gray-600">
              Discover and create curated reading lists
            </p>
          </div>

          {/* Search and Tabs */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search reading lists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
                  </div>
                  
              {/* Tabs */}
                  <div className="flex gap-2">
                    <Button 
                  variant={activeTab === 'all' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('all')}
                  className={activeTab === 'all' ? 'bg-[#D01E1E] hover:bg-[#B01818]' : ''}
                >
                  All Lists
                </Button>
                <Button
                  variant={activeTab === 'my' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('my')}
                  className={activeTab === 'my' ? 'bg-[#D01E1E] hover:bg-[#B01818]' : ''}
                >
                  My Lists
                    </Button>
                    <Button 
                  variant={activeTab === 'following' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('following')}
                  className={activeTab === 'following' ? 'bg-[#D01E1E] hover:bg-[#B01818]' : ''}
                >
                  Following
                    </Button>
                  </div>
                </div>
        </div>

          {/* Reading Lists Grid */}
          {filteredLists.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No matching lists found' : 'No reading lists yet'}
              </h3>
            <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : activeTab === 'my' 
                    ? 'Create your first reading list to get started'
                    : 'Be the first to create a reading list'
                }
              </p>
              {!searchTerm && activeTab === 'my' && (
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-[#D01E1E] hover:bg-[#B01818]"
                >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First List
              </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLists.map((list: any) => (
                <ReadingListCard
                  key={list._id || list.id}
                  id={list._id || list.id}
                  name={list.title}
                  description={list.description}
                  creatorName={list.creator?.username || 'Unknown'}
                  books={list.books || []}
                  followersCount={list.followers?.length || 0}
                  showActions={true}
                />
              ))}
          </div>
        )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default ReadingLists;
