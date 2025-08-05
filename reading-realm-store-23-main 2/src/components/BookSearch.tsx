
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface BookSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceFilter: string;
  onPriceFilterChange: (filter: string) => void;
}

const BookSearch = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  priceFilter,
  onPriceFilterChange
}: BookSearchProps) => {
  const priceFilters = ['All', 'Free', 'Paid'];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input 
          placeholder="Search books, authors, tags..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-[#D01E1E]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Category:</span>
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === selectedCategory ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className={category === selectedCategory 
                ? "bg-[#D01E1E] hover:bg-[#B01818]" 
                : "hover:bg-[#D01E1E]/5 hover:border-[#D01E1E]/20"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Price Filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Price:</span>
          {priceFilters.map((filter) => (
            <Button
              key={filter}
              variant={filter === priceFilter ? "default" : "outline"}
              size="sm"
              onClick={() => onPriceFilterChange(filter)}
              className={filter === priceFilter 
                ? "bg-[#D01E1E] hover:bg-[#B01818]" 
                : "hover:bg-[#D01E1E]/5 hover:border-[#D01E1E]/20"
              }
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookSearch;
