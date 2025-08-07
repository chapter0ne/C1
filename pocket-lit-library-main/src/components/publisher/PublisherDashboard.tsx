
import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Users, BookOpen, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EarningsTab from './tabs/EarningsTab';
import AudienceTab from './tabs/AudienceTab';
import BooksTab from './tabs/BooksTab';
import { useIsMobile } from '@/hooks/use-mobile';

const randomDashboardData = {
  audience: {
    totalReaders: Math.floor(Math.random() * 3000) + 10000, // Minimum 10,000
    totalCountries: Math.floor(Math.random() * 12) + 8,
    readerGrowth: `+${Math.floor(Math.random() * 400) + 100} readers`,
    growthPercentage: Math.floor(Math.random() * 15) + 5,
    demographicsData: generateDemographicData()
  },
};

function generateDemographicData() {
  const countries = [
    { name: 'Nigeria', icon: '🇳🇬' },
    { name: 'Kenya', icon: '🇰🇪' },
    { name: 'Ghana', icon: '🇬🇭' },
    { name: 'South Africa', icon: '🇿🇦' },
    { name: 'Other', icon: '🌍' }
  ];
  
  let remainingPercentage = 100;
  
  return countries.map((country, index) => {
    if (index === countries.length - 1) {
      return {
        country: country.name,
        percentage: remainingPercentage,
        readers: Math.round((Math.floor(Math.random() * 3000) + 10000) * (remainingPercentage / 100)), // Minimum 10,000
        icon: country.icon
      };
    }
    
    const maxPossiblePercentage = Math.min(remainingPercentage - (countries.length - index - 1), 60);
    const minPossiblePercentage = Math.max(5, remainingPercentage - (countries.length - index - 1) * 60);
    
    const percentage = Math.floor(Math.random() * (maxPossiblePercentage - minPossiblePercentage + 1)) + minPossiblePercentage;
    remainingPercentage -= percentage;
    
    return {
      country: country.name,
      percentage,
      readers: Math.round((Math.floor(Math.random() * 3000) + 10000) * (percentage / 100)), // Minimum 10,000
      icon: country.icon
    };
  });
}

const PublisherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('earnings');
  const [isVisible, setIsVisible] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const tabNames = ['earnings', 'audience', 'books'];
  const [changesMade, setChangesMade] = useState(0);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
          setChangesMade(0);
        }
      },
      { threshold: 0.2 }
    );
    
    if (dashboardRef.current) {
      observer.observe(dashboardRef.current);
    }
    
    return () => {
      if (dashboardRef.current) {
        observer.unobserve(dashboardRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isVisible && changesMade < 1) {
      timeout = setTimeout(() => {
        const currentIndex = tabNames.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % tabNames.length;
        
        setActiveTab(tabNames[nextIndex]);
        setChangesMade(prev => prev + 1);
      }, 3000);
    }
    
    return () => {
      clearTimeout(timeout);
    };
  }, [isVisible, activeTab, changesMade, tabNames]);

  return (
    <div ref={dashboardRef} className="relative bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-chapterRed-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm md:text-base">C1</span>
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base">Publisher Dashboard</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Analytics & Earnings</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground ml-auto mt-1 md:mt-0">Last updated: Today</span>
      </div>
      
      <Tabs 
        defaultValue="earnings" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 mb-4 relative w-full">
          {['earnings', 'audience', 'books'].map((tab) => (
            <TabsTrigger 
              key={tab}
              value={tab} 
              className={`text-xs flex items-center justify-center gap-1 group hover:bg-chapterRed-50/50 transition-all duration-300 px-1 md:px-3
                ${activeTab === tab ? 'font-medium' : 'hover:text-chapterRed-600'}`}
            >
              {tab === 'earnings' && <BarChart3 size={isMobile ? 12 : 14} className="transition-transform duration-300" />}
              {tab === 'audience' && <Users size={isMobile ? 12 : 14} className="transition-transform duration-300" />}
              {tab === 'books' && <BookOpen size={isMobile ? 12 : 14} className="transition-transform duration-300" />}
              <span className="inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              <ChevronRight size={isMobile ? 12 : 14} className={`transition-transform duration-300 ${activeTab === tab ? 'rotate-90 text-chapterRed-500' : 'group-hover:translate-x-0.5'}`} />
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className={`${isMobile ? 'h-[400px]' : 'h-[650px]'} relative overflow-hidden`}>
          <TabsContent value="earnings" className="absolute inset-0 w-full h-full">
            <EarningsTab />
          </TabsContent>
          
          <TabsContent value="audience" className="absolute inset-0 w-full h-full overflow-auto">
            <div className="pr-2">
              <AudienceTab dashboardData={randomDashboardData.audience} />
            </div>
          </TabsContent>
          
          <TabsContent value="books" className="absolute inset-0 w-full h-full overflow-auto">
            <div className="pr-2">
              <BooksTab />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PublisherDashboard;
