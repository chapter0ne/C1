
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { usePublishedBooks } from "@/hooks/books/usePublishedBooks";
import { useDashboardData } from "@/hooks/useDashboardData";

const DashboardTabs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("all-genres");
  const [monthFilter, setMonthFilter] = useState("current-month");
  const { data: dashboardData, isLoading: salesLoading } = useDashboardData();

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
  const allSales = dashboardData?.allSales || [];
  
  // Filter by month
  const getFilteredSalesByMonth = () => {
    if (monthFilter === "current-month") {
      // Show only current month sales
      const now = new Date();
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
  
  const filteredSales = monthFilteredSales.filter(sale => {
    const matchesSearch = sale.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.book?.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter === "all-genres" || (sale.book?.genre?.toLowerCase() === genreFilter);
    return matchesSearch && matchesGenre;
  });

  return (
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
                  <SelectItem value="current-month">Current Month</SelectItem>
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
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.book?.title || 'Unknown'}</TableCell>
                      <TableCell>{sale.book?.author || 'Unknown'}</TableCell>
                      <TableCell>{sale.book?.genre || 'Unknown'}</TableCell>
                      <TableCell>{new Date(sale.purchased_at).toLocaleDateString()}</TableCell>
                      <TableCell>{sale.user?.username || sale.user?.email || 'Unknown'}</TableCell>
                      <TableCell className="text-right">₦{Number(sale.amountPaid || sale.amount_paid).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DashboardTabs;
