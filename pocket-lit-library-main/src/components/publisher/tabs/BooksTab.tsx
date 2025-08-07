
import React from 'react';
import { BookOpen, Award, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BooksTab: React.FC = () => {
  const booksData = [
    { 
      title: 'Things Fall Apart', 
      author: 'Chinua Achebe',
      sales: 142, 
      revenue: '$568.00', 
      rating: 4.8,
      growth: '+12%'
    },
    { 
      title: 'Half of a Yellow Sun', 
      author: 'Chimamanda Adichie',
      sales: 98, 
      revenue: '$392.00', 
      rating: 4.7,
      growth: '+8%'
    },
    { 
      title: 'Born a Crime', 
      author: 'Trevor Noah',
      sales: 76, 
      revenue: '$304.00', 
      rating: 4.9,
      growth: '+15%'
    },
    { 
      title: 'Americanah', 
      author: 'Chimamanda Adichie',
      sales: 52, 
      revenue: '$208.00', 
      rating: 4.6,
      growth: '+5%'
    }
  ];

  return (
    <div className="space-y-4">
      <Card className="border border-chapterRed-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen size={16} className="text-chapterRed-500 mr-2" />
              Top Performing Books
            </CardTitle>
            <span className="text-xs text-chapterRed-500 cursor-pointer hover:underline">See all books</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {booksData.map((book, index) => (
              <div key={index} className="p-3 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h5 className="font-medium text-sm">{book.title}</h5>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-chapterRed-50 px-2 py-0.5 rounded-full">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-medium">{book.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground block">Sales</span>
                      <span className="font-medium text-sm">{book.sales}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Revenue</span>
                      <span className="font-medium text-sm">{book.revenue}</span>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">{book.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-secondary/30 rounded-lg border border-chapterRed-100">
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} className="text-chapterRed-500" />
            <h4 className="text-sm font-medium">Best Category</h4>
          </div>
          <div className="text-base font-bold">Fiction</div>
          <div className="text-xs text-muted-foreground mt-1">68% of total sales</div>
        </div>
        
        <div className="p-4 bg-secondary/30 rounded-lg border border-chapterRed-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-chapterRed-500" />
            <h4 className="text-sm font-medium">Trending</h4>
          </div>
          <div className="text-base font-bold">Biography</div>
          <div className="text-xs text-muted-foreground mt-1">+24% this month</div>
        </div>
      </div>
    </div>
  );
};

export default BooksTab;
