
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, BookOpen, Star } from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";

const MetricsGrid = () => {
  const { data: metrics, isLoading } = useMetrics();

  const gridMetrics = [
    {
      title: "Total Sales",
      value: metrics ? `₦${metrics.totalRevenue.toLocaleString()}` : "-",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Users",
      value: metrics ? metrics.activeUsers.toLocaleString() : "-",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Books",
      value: metrics ? metrics.totalBooks.toLocaleString() : "-",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Monthly Sales",
      value: metrics ? `₦${metrics.monthlySales.toLocaleString()}` : "-",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {gridMetrics.map((metric, index) => (
        <Card key={index} className="cursor-default">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : metric.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsGrid;
