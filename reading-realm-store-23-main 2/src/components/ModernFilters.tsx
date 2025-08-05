
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

interface ModernFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceFilter: string;
  onPriceFilterChange: (filter: string) => void;
}

const ModernFilters = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  priceFilter,
  onPriceFilterChange
}: ModernFiltersProps) => {
  const priceFilters = ["All", "Free", "Paid"];

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 mb-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          placeholder="Search books, authors, genres..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-3 bg-gray-100 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D01E1E]/20 focus:bg-white text-sm" 
        />
      </div>

      {/* Filter Pills - Categories and Price on same line */}
      <div className="space-y-4">
        {/* Categories and Price Filters on same line */}
        <div className="flex flex-wrap gap-4">
          {/* Categories */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === selectedCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(category)}
                  className={`rounded-full px-4 py-1 text-xs font-medium transition-all ${
                    category === selectedCategory 
                      ? "bg-[#D01E1E] text-white hover:bg-[#B01818] shadow-sm" 
                      : "border-gray-300 text-gray-700 hover:border-[#D01E1E] hover:text-[#D01E1E] hover:bg-[#D01E1E]/5"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide">Price</p>
            <div className="flex flex-wrap gap-2">
              {priceFilters.map((filter) => (
                <Button
                  key={filter}
                  variant={filter === priceFilter ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPriceFilterChange(filter)}
                  className={`rounded-full px-4 py-1 text-xs font-medium transition-all ${
                    filter === priceFilter 
                      ? "bg-[#D01E1E] text-white hover:bg-[#B01818] shadow-sm" 
                      : "border-gray-300 text-gray-700 hover:border-[#D01E1E] hover:text-[#D01E1E] hover:bg-[#D01E1E]/5"
                  }`}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toggle for Mobile */}
      <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
        <Button variant="outline" size="sm" className="w-full rounded-xl text-gray-600 border-gray-300">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>
    </div>
  );
};

export default ModernFilters;
