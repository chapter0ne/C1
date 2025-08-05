
import { useState } from "react";
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
  const { data: dashboardData, isLoading: salesLoading } = useDashboardData();

  // Sales filtering
  const sales = dashboardData?.monthlyPurchases || [];
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.book?.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter === "all-genres" || (sale.book?.genre?.toLowerCase() === genreFilter);
    return matchesSearch && matchesGenre;
  });

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-6">
            <TabsTrigger value="sales">All Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <div className="flex space-x-4">
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
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-genres">All Genres</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
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
                      <TableCell className="text-right">₦{Number(sale.amount_paid).toLocaleString()}</TableCell>
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
