
import React, { useState } from 'react';
import { TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ScrollArea } from "@/components/ui/scroll-area";

const EarningsTab: React.FC = () => {
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  
  const revenueData = [
    { month: 'Jan', revenue: 680, books: 170 },
    { month: 'Feb', revenue: 740, books: 185 },
    { month: 'Mar', revenue: 880, books: 220 },
    { month: 'Apr', revenue: 1020, books: 255 },
    { month: 'May', revenue: 1180, books: 295 },
    { month: 'Jun', revenue: 1240, books: 310 },
  ];

  const weeklyData = [
    { day: 'Mon', revenue: 180 },
    { day: 'Tue', revenue: 145 },
    { day: 'Wed', revenue: 235 },
    { day: 'Thu', revenue: 290 },
    { day: 'Fri', revenue: 320 },
    { day: 'Sat', revenue: 380 },
    { day: 'Sun', revenue: 420 },
  ];

  const chartData = viewMode === 'monthly' ? revenueData : weeklyData;
  const xKey = viewMode === 'monthly' ? 'month' : 'day';

  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-4 pr-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-secondary rounded-lg">
            <h4 className="text-sm font-medium mb-1">Monthly Earnings</h4>
            <div className="text-2xl font-bold">$1,240.50</div>
            <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
              <TrendingUp size={12} />
              <span>+12.5% from last month</span>
            </div>
          </div>
          
          <div className="p-4 bg-secondary rounded-lg">
            <h4 className="text-sm font-medium mb-1">Total Books Sold</h4>
            <div className="text-2xl font-bold">328</div>
            <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
              <TrendingUp size={12} />
              <span>+8.2% from last month</span>
            </div>
          </div>
        </div>
        
        <Card className="border border-chapterRed-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 size={16} className="text-chapterRed-500 mr-2" />
                Revenue Trends ({viewMode === 'monthly' ? 'Last 6 Months' : 'Last Week'})
              </CardTitle>
              <div className="flex gap-2">
                <span 
                  className={`text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                    viewMode === 'monthly' 
                      ? 'bg-chapterRed-50 text-chapterRed-500' 
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                  onClick={() => setViewMode('monthly')}
                >
                  Monthly
                </span>
                <span 
                  className={`text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                    viewMode === 'weekly' 
                      ? 'bg-chapterRed-50 text-chapterRed-500' 
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                  onClick={() => setViewMode('weekly')}
                >
                  Weekly
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 0,
                    left: -20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey={xKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-xs">
                            <p className="font-medium">{payload[0].payload[xKey]}</p>
                            <p className="text-chapterRed-500">Revenue: ${payload[0].value}</p>
                            {viewMode === 'monthly' && (
                              <p className="text-gray-600">Books: {payload[0].payload.books}</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#f87171" 
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-chapterRed-500 rounded-sm inline-block"></span>
                <span>{viewMode === 'monthly' ? 'Monthly' : 'Daily'} revenue</span>
              </div>
              <span className="text-chapterRed-500 font-medium cursor-pointer hover:underline">View detailed report</span>
            </div>
          </CardContent>
        </Card>

        <div className="p-4 bg-secondary/30 border border-chapterRed-100 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold flex items-center">
              <BarChart3 size={16} className="text-chapterRed-500 mr-2" />
              Earnings Analysis
            </h4>
            <span className="text-xs text-chapterRed-500 font-medium">View detailed report</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">Projected Annual Revenue:</span>
                <span className="text-green-600 ml-2">$14,886.00</span>
              </div>
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">+18.5% YoY</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">Average Revenue Per Book:</span>
                <span className="text-chapterRed-600 ml-2">$3.78</span>
              </div>
              <span className="text-xs bg-chapterRed-50 text-chapterRed-500 px-2 py-0.5 rounded-full">Top 15%</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">Revenue Growth Rate:</span>
                <span className="ml-2">12.3% monthly</span>
              </div>
              <ArrowRight size={14} className="text-chapterRed-500" />
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Based on your current growth trajectory, you're on track to exceed your annual target by <span className="font-medium text-chapterRed-600">23%</span>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default EarningsTab;
