
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Search, Plus, Eye, Edit, Trash2, BookOpen, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { usePublishedBooks } from "@/hooks/books/usePublishedBooks";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTopBooks, TopBooksPeriod } from "@/hooks/useTopBooks";
import BookStatsModal from "@/components/BookStatsModal";

const DashboardTabs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("all-genres");
  const [monthFilter, setMonthFilter] = useState("current-month");
  const [topBooksPeriod, setTopBooksPeriod] = useState<TopBooksPeriod>('today');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const { data: dashboardData, isLoading: salesLoading } = useDashboardData();
  const { data: topBooks, isLoading: topBooksLoading } = useTopBooks(topBooksPeriod, 5);

  // Listen for filter change events from dashboard cards
  useEffect(() => {
    const handleFilterChange = (event: CustomEvent) => {
      if (event.detail?.filter === 'all-time') {
        setMonthFilter('all-time');
      }
    };

    window.addEventListener('changeMonthFilter', handleFilterChange as EventListener);
    return () => window.removeEventListener('changeMonthFilter', handleFilterChange as EventListener);
  }, []);

  // Sales filtering with month support
  // Show all purchases in the table (to display status), but calculations use only completed ones
  const allSales = dashboardData?.allSales || [];
  
  // Filter by month
  const getFilteredSalesByMonth = () => {
    const now = new Date();
    
    if (monthFilter === "today") {
      // Show only today's sales
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startOfDay.setHours(0, 0, 0, 0);
      
      return allSales.filter(sale => {
        const saleDate = new Date(sale.purchasedAt || sale.createdAt);
        return saleDate >= startOfDay;
      });
    }
    
    if (monthFilter === "this-week") {
      // Show this week's sales (starting from Sunday)
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      
      return allSales.filter(sale => {
        const saleDate = new Date(sale.purchasedAt || sale.createdAt);
        return saleDate >= startOfWeek;
      });
    }
    
    if (monthFilter === "current-month") {
      // Show only current month sales
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      return allSales.filter(sale => {
        const saleDate = new Date(sale.purchasedAt || sale.createdAt);
        return saleDate >= startOfMonth;
      });
    }
    
    if (monthFilter === "all-time") {
      // Show all sales
      return allSales;
    }
    
    // Filter by specific month
    const targetMonth = parseInt(monthFilter.split('-')[1]) - 1; // month is 0-indexed
    const targetYear = parseInt(monthFilter.split('-')[0]);
    
    return allSales.filter(sale => {
      const saleDate = new Date(sale.purchasedAt || sale.createdAt);
      return saleDate.getMonth() === targetMonth && saleDate.getFullYear() === targetYear;
    });
  };

  const monthFilteredSales = getFilteredSalesByMonth();
  
  const filteredSales = monthFilteredSales
    .filter(sale => {
      const matchesSearch = sale.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.book?.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = genreFilter === "all-genres" || (sale.book?.genre?.toLowerCase() === genreFilter);
      return matchesSearch && matchesGenre;
    })
    // Sort by newest to oldest
    .sort((a, b) => {
      const dateA = new Date(a.purchasedAt || a.purchased_at || a.createdAt).getTime();
      const dateB = new Date(b.purchasedAt || b.purchased_at || b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });

  return (
    <>
    <Card id="sales-section" tabIndex={-1}>
      <CardContent className="p-6">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-6">
            <TabsTrigger value="sales">All Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search books, authors, or buyers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-genres">All Genres</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="fiction">Fiction</SelectItem>
                </SelectContent>
              </Select>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="current-month">This Month</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="2024-01">January 2024</SelectItem>
                  <SelectItem value="2024-02">February 2024</SelectItem>
                  <SelectItem value="2024-03">March 2024</SelectItem>
                  <SelectItem value="2024-04">April 2024</SelectItem>
                  <SelectItem value="2024-05">May 2024</SelectItem>
                  <SelectItem value="2024-06">June 2024</SelectItem>
                  <SelectItem value="2024-07">July 2024</SelectItem>
                  <SelectItem value="2024-08">August 2024</SelectItem>
                  <SelectItem value="2024-09">September 2024</SelectItem>
                  <SelectItem value="2024-10">October 2024</SelectItem>
                  <SelectItem value="2024-11">November 2024</SelectItem>
                  <SelectItem value="2024-12">December 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => {
                    const status = sale.status || 'pending';
                    const statusColors = {
                      completed: 'bg-green-100 text-green-800',
                      success: 'bg-green-100 text-green-800',
                      pending: 'bg-yellow-100 text-yellow-800',
                      failed: 'bg-red-100 text-red-800',
                      cancelled: 'bg-gray-100 text-gray-800',
                    };
                    const statusColor = statusColors[status] || 'bg-gray-100 text-gray-800';
                    
                    return (
                      <TableRow key={sale.id || sale._id}>
                        <TableCell className="font-medium">
                          {(() => {
                            const bookId = sale.book?._id || sale.book?.id || sale.book;
                            if (bookId) {
                              return (
                                <button
                                  onClick={() => setSelectedBookId(bookId.toString())}
                                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                  {sale.book?.title || 'Unknown'}
                                </button>
                              );
                            }
                            return 'Unknown';
                          })()}
                        </TableCell>
                        <TableCell>{sale.book?.author || 'Unknown'}</TableCell>
                        <TableCell>{sale.book?.genre || 'Unknown'}</TableCell>
                        <TableCell>{new Date(sale.purchasedAt || sale.purchased_at || sale.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{sale.user?.username || sale.user?.email || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge className={statusColor}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">₦{Number(sale.amountPaid || sale.amount_paid || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    {/* Top Books Section */}
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="grid w-full grid-cols-4 bg-muted p-1 rounded-lg">
            {(['today', 'weekly', 'monthly', 'all-time'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTopBooksPeriod(period)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  topBooksPeriod === period
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {period === 'today' ? 'Today' : period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Top 5 Books {topBooksPeriod === 'today' ? 'Today' : topBooksPeriod === 'weekly' ? 'This Week' : topBooksPeriod === 'monthly' ? 'This Month' : '(All Time)'}
          </h3>
          {topBooksLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : topBooks && topBooks.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {topBooks.map((item: any, index: number) => (
                <div
                  key={item.bookId || item.book?._id}
                  onClick={() => setSelectedBookId(item.bookId || item.book?._id)}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.book?.title || 'Unknown Book'}
                      </p>
                      <p className="text-sm text-gray-600">
                        by {item.book?.author || 'Unknown Author'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Library Count</p>
                      <p className="text-lg font-bold">{item.libraryCount}</p>
                    </div>
                    {item.book?.isFree === false && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Purchases</p>
                        <p className="text-lg font-bold">{item.purchaseCount}</p>
                      </div>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No books added to libraries {topBooksPeriod === 'today' ? 'today' : topBooksPeriod === 'weekly' ? 'this week' : topBooksPeriod === 'monthly' ? 'this month' : 'yet'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Book Stats Modal */}
    <BookStatsModal
      bookId={selectedBookId}
      isOpen={!!selectedBookId}
      onClose={() => setSelectedBookId(null)}
    />
    </>
  );
};

export default DashboardTabs;
