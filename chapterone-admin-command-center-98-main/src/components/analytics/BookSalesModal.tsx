
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BookSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  month?: string | null;
  genre?: string | null;
}

const BookSalesModal = ({ isOpen, onClose, month, genre }: BookSalesModalProps) => {
  const salesData = [
    { id: 1, bookTitle: "The Great Adventure", author: "John Doe", date: "2024-06-15", sales: 25, revenue: 375 },
    { id: 2, bookTitle: "Mystery Novel", author: "Sarah Wilson", date: "2024-06-14", sales: 18, revenue: 270 },
    { id: 3, bookTitle: "Tech Mastery", author: "Jane Smith", date: "2024-06-13", sales: 12, revenue: 240 },
    { id: 4, bookTitle: "Business Basics", author: "Mike Johnson", date: "2024-06-12", sales: 9, revenue: 135 },
    { id: 5, bookTitle: "Self Development", author: "Tom Brown", date: "2024-06-11", sales: 15, revenue: 225 },
  ];

  const getTitle = () => {
    if (month) return `Sales for ${month}`;
    if (genre) return `${genre} Book Sales`;
    return "Book Sales Details";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{getTitle()}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Book Title</th>
                  <th className="text-left py-3 px-4">Author</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-right py-3 px-4">Sales</th>
                  <th className="text-right py-3 px-4">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{sale.bookTitle}</td>
                    <td className="py-3 px-4">{sale.author}</td>
                    <td className="py-3 px-4">{sale.date}</td>
                    <td className="py-3 px-4 text-right">{sale.sales}</td>
                    <td className="py-3 px-4 text-right">${sale.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <div className="flex gap-8">
                <span>Sales: {salesData.reduce((sum, sale) => sum + sale.sales, 0)}</span>
                <span>Revenue: ${salesData.reduce((sum, sale) => sum + sale.revenue, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookSalesModal;
