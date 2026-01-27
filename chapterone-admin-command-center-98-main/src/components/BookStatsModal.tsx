import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useBookDetailedStats } from "@/hooks/useTopBooks";
import { Loader2 } from "lucide-react";

interface BookStatsModalProps {
  bookId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookStatsModal = ({ bookId, isOpen, onClose }: BookStatsModalProps) => {
  const { data: stats, isLoading } = useBookDetailedStats(bookId);

  if (!isOpen || !bookId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? 'Loading Stats...' : `${stats?.book?.title || 'Book'} - Detailed Statistics`}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Book Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Author</p>
                <p className="font-medium">{stats.book.author}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Genre</p>
                <p className="font-medium">{stats.book.genre || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Publish Date</p>
                <p className="font-medium">
                  {stats.book.publishDate 
                    ? new Date(stats.book.publishDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Total Library Count</p>
                <p className="text-2xl font-bold">{stats.stats.totalLibraryCount}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Last Month's Library Count</p>
                <p className="text-2xl font-bold">{stats.stats.lastMonthLibraryCount}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₦{stats.stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Purchase Count</p>
                <p className="text-2xl font-bold">{stats.stats.purchaseCount}</p>
                <p className="text-xs text-gray-500 mt-1">Completed purchases</p>
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Monthly Breakdown (Last 12 Months)</h3>
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Purchases</TableHead>
                      <TableHead className="text-right">Library Additions</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.monthlyBreakdown.map((month: any) => (
                      <TableRow key={month.month}>
                        <TableCell>{month.monthName}</TableCell>
                        <TableCell className="text-right">{month.purchaseCount}</TableCell>
                        <TableCell className="text-right">{month.libraryCount}</TableCell>
                        <TableCell className="text-right">₦{month.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Purchase Timeline */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Purchase Timeline</h3>
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Transaction ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.purchaseTimeline.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          No purchases yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.purchaseTimeline.map((purchase: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(purchase.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{purchase.user}</TableCell>
                          <TableCell className="text-right">
                            <div>
                              ₦{Number(purchase.amount).toLocaleString()}
                              {purchase.isMultiBook && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {purchase.bookCount} books
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {purchase.transactionId || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 p-8">No statistics available</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookStatsModal;
