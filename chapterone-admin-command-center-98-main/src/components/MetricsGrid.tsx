
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, BookOpen, Star } from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";
import { useNavigate } from "react-router-dom";

const MetricsGrid = () => {
  const { data: metrics, isLoading } = useMetrics();
  const navigate = useNavigate();

  const handleCardClick = (type: string) => {
    switch (type) {
      case 'users':
        navigate('/users');
        break;
      case 'books':
        navigate('/books');
        break;
      case 'total-sales':
        // Scroll to sales section and set filter to show all sales
        setTimeout(() => {
          const salesSection = document.getElementById('sales-section');
          if (salesSection) {
            salesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            salesSection.focus();
            
            // Trigger a custom event to change the month filter to show all sales
            const changeFilterEvent = new CustomEvent('changeMonthFilter', { 
              detail: { filter: 'all-time' } 
            });
            window.dispatchEvent(changeFilterEvent);
          }
        }, 100);
        break;
      case 'monthly-sales':
        // Scroll to sales section and focus
        setTimeout(() => {
          const salesSection = document.getElementById('sales-section');
          if (salesSection) {
            salesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            salesSection.focus();
          }
        }, 100);
        break;
      default:
        break;
    }
  };

  const gridMetrics = [
    {
      title: "Total Sales",
      value: metrics ? `₦${metrics.totalRevenue.toLocaleString()}` : "-",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      clickable: true,
      type: 'total-sales',
    },
    {
      title: "Total Users",
      value: metrics ? metrics.activeUsers.toLocaleString() : "-",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      clickable: true,
      type: 'users',
    },
    {
      title: "Total Books",
      value: metrics ? metrics.totalBooks.toLocaleString() : "-",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      clickable: true,
      type: 'books',
    },
    {
      title: "Monthly Sales",
      value: metrics ? `₦${metrics.monthlySales.toLocaleString()}` : "-",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      clickable: true,
      type: 'monthly-sales',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {gridMetrics.map((metric, index) => (
        <Card 
          key={index} 
          className={`${metric.clickable ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105' : 'cursor-default'}`}
          onClick={() => metric.clickable && handleCardClick(metric.type)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : metric.value}
                </p>
                {metric.clickable && (
                  <p className="text-xs text-gray-500 mt-1">
                    Click to view details
                  </p>
                )}
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
