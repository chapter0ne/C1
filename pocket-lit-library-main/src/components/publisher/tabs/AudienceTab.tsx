
import React, { useState, useEffect } from 'react';
import { Users, Globe, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Define the interface for the dashboard data
interface DemographicData {
  country: string;
  percentage: number;
  readers: number;
  icon: string;
}

interface AudienceTabProps {
  dashboardData: {
    totalReaders: number;
    totalCountries: number;
    readerGrowth: string;
    growthPercentage: number;
    demographicsData: DemographicData[];
  };
}

// Helper function to generate random numbers within a range
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const AudienceTab: React.FC<AudienceTabProps> = ({ dashboardData }) => {
  const [progressValues, setProgressValues] = useState<number[]>(Array(5).fill(0));
  
  // Animate progress bars when tab is shown
  useEffect(() => {
    if (dashboardData.demographicsData.length === 0) return;
    
    const timeout = setTimeout(() => {
      // Animate each bar with a small delay between them
      dashboardData.demographicsData.forEach((item, index) => {
        setTimeout(() => {
          setProgressValues(prev => {
            const newValues = [...prev];
            newValues[index] = item.percentage;
            return newValues;
          });
        }, index * 500); // Keeping the delay between bars at 500ms
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [dashboardData.demographicsData]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-4 bg-secondary rounded-lg">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-chapterRed-500" />
            <h4 className="text-sm font-medium">Total Readers</h4>
          </div>
          <div className="text-2xl font-bold mt-1">{dashboardData.totalReaders.toLocaleString()}</div>
        </div>
        
        <div className="p-4 bg-secondary rounded-lg">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-chapterRed-500" />
            <h4 className="text-sm font-medium">Countries</h4>
          </div>
          <div className="text-2xl font-bold mt-1">{dashboardData.totalCountries}</div>
        </div>
      </div>
      
      <Card className="border border-chapterRed-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Globe size={16} className="text-chapterRed-500 mr-2" />
            Reader Demographics
          </CardTitle>
          <CardDescription className="text-xs">
            Geographic distribution of your readers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {dashboardData.demographicsData.map((item, index) => (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{item.readers.toLocaleString()} readers</span>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
              </div>
              <Progress 
                value={progressValues[index]} 
                className={`h-2 transition-all duration-4000 ease-out ${
                  index === 0 ? "bg-chapterRed-100" : 
                  index === 1 ? "bg-chapterRed-100" : 
                  index === 2 ? "bg-chapterRed-100" :
                  index === 3 ? "bg-chapterRed-100" : "bg-chapterRed-100"
                }`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="p-4 bg-secondary/30 border border-chapterRed-100 rounded-lg">
        <h4 className="text-sm font-medium mb-2 flex items-center">
          <TrendingUp size={16} className="text-chapterRed-500 mr-2" />
          Reader Growth
        </h4>
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Last 30 days:</span>
            <span className="font-medium ml-2">{dashboardData.readerGrowth}</span>
          </div>
          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">+{dashboardData.growthPercentage}.{getRandomNumber(1, 9)}%</span>
        </div>
      </div>
    </div>
  );
};

export default AudienceTab;
