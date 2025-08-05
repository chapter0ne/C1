
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const RecentActivity = () => {
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentSales = dashboardData?.recentSales || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSales.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent sales</p>
          ) : (
            recentSales.map((sale) => (
              <div key={sale._id || sale.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {sale.book?.cover_image_url ? (
                    <img 
                      src={sale.book.cover_image_url} 
                      alt={sale.book.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-gray-800 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">B</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {sale.book?.title || 'Unknown Book'}
                  </p>
                  <p className="text-sm text-gray-600">
                    by {sale.user?.username || sale.user?.email || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(sale.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ₦{Number(sale.amount_paid || sale.amountPaid || 0).toLocaleString()}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
