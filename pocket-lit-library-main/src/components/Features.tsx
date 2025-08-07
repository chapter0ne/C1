
import React from 'react';
import { Library, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const features = [
  { 
    icon: Library,
    title: "Extensive Digital Collection", 
    description: "Access thousands of bestsellers, classics, and exclusive titles across all genres in one seamless app." 
  },
  { 
    icon: Clock,
    title: "Read Anywhere, Anytime", 
    description: "Your library travels with you. Enjoy your books offline during commutes, flights, or cozy reading sessions." 
  },
  { 
    icon: CheckCircle,
    title: "Personalized Reading Experience", 
    description: "Discover new favorites with our intelligent recommendation engine that learns your preferences and reading habits." 
  }
];

const Features: React.FC = () => {
  return (
    <div className="grid md:grid-cols-3 gap-4 mt-10">
      {features.map((feature, index) => (
        <Card 
          key={index} 
          className="intersect-trigger border-chapterRed-100/30 hover:shadow-lg transition-all duration-300 overflow-hidden group w-full"
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chapterRed-300 to-chapterRed-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chapterRed-100 to-chapterRed-200 flex items-center justify-center mb-4 group-hover:from-chapterRed-200 group-hover:to-chapterRed-300 transition-colors duration-300">
              <feature.icon size={18} className="text-chapterRed-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Features;
