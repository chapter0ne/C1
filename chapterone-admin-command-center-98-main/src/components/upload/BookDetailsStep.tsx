
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, X, Plus } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface FormData {
  title: string;
  author: string;
  description: string;
  genre: string;
  isbn: string;
  price: string;
  isFree: boolean;
  coverImage?: File;
}

interface BookDetailsStepProps {
  formData: FormData;
  selectedTags: string[];
  coverImageUrl?: string | null; // Add this prop for existing cover images
  onInputChange: (field: string, value: string | boolean | File) => void;
  onTagToggle: (tag: string) => void;
  isValid: boolean;
}

const BookDetailsStep = ({
  formData,
  selectedTags,
  coverImageUrl, // Add this prop
  onInputChange,
  onTagToggle,
  isValid
}: BookDetailsStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState("");
  
  // Initialize previewUrl with existing cover image if available
  useEffect(() => {
    if (coverImageUrl) {
      setPreviewUrl(coverImageUrl);
    }
  }, [coverImageUrl]);

  const availableTags = [
    // Fiction Categories
    "Fiction", "Romance", "Thriller", "Adventure", "Mystery", "Fantasy", "Sci-Fi", "Horror", "Drama", "Comedy", "Crime", "Short Stories",
    
    // Non-Fiction Categories (Limited to business requirements)
    "Non-Fiction", "Biography", "Autobiography", "Poetry", "Poems"
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onInputChange('coverImage', file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeCoverImage = () => {
    onInputChange('coverImage', null as any);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      onTagToggle(customTag.trim());
      setCustomTag("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Book Cover */}
      <Card>
        <CardHeader>
          <CardTitle>Book Cover</CardTitle>
          <p className="text-sm text-gray-600">Upload your book cover image</p>
          {!coverImageUrl && !formData.coverImage && (
            <p className="text-xs text-red-500">Required</p>
          )}
        </CardHeader>
        <CardContent>
          <div onClick={handleUploadClick} className="border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-400 transition-colors cursor-pointer rounded-2xl bg-neutral-50 relative py-[144px]">
            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="Book cover preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                <button onClick={e => {
                  e.stopPropagation();
                  removeCoverImage();
                }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X className="h-4 w-4" />
                </button>
                <div className="mt-2 text-sm text-gray-600">
                  {coverImageUrl && !formData.coverImage ? 'Existing cover image' : 'New cover image'}
                </div>
              </div>
            ) : (
              <div className="py-16">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2 focus:outline-2">Upload cover image</p>
                <p className="text-xs text-red-500 mb-2">Required</p>
                <p className="text-sm text-gray-500 mb-4">Recommended size: 1400 x 2100 pixels (2:3 ratio)</p>
                <Button variant="outline" className="border-0">Select Cover Image</Button>
              </div>
            )}
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
          </div>
        </CardContent>
      </Card>

      {/* Book Details */}
      <Card>
        <CardHeader>
          <CardTitle>Book Details</CardTitle>
          <p className="text-sm text-gray-600">Enter the basic information about your book</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input id="title" placeholder="Enter book title" value={formData.title} onChange={e => onInputChange('title', e.target.value)} className="focus:border-black focus:ring-0" />
          </div>
          
          <div>
            <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
            <Input id="author" placeholder="Enter author name" value={formData.author} onChange={e => onInputChange('author', e.target.value)} className="focus:border-black focus:ring-0" />
          </div>
          
          <div>
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea id="description" placeholder="Enter book description" rows={4} value={formData.description} onChange={e => onInputChange('description', e.target.value)} className="focus:border-black focus:ring-0" />
          </div>
          
          <div>
            <Label htmlFor="genre">Primary Genre <span className="text-red-500">*</span></Label>
            <Select value={formData.genre} onValueChange={value => onInputChange('genre', value)}>
              <SelectTrigger className="focus:border-black focus:ring-0">
                <SelectValue placeholder="Select Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fiction">Fiction</SelectItem>
                <SelectItem value="non-fiction">Non-Fiction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="tags">Tags <span className="text-red-500">*</span></Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  placeholder="Add custom tag" 
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="focus:border-black focus:ring-0"
                />
                <Button 
                  type="button"
                  onClick={handleAddCustomTag}
                  variant="outline"
                  disabled={!customTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant={selectedTags.includes(tag) ? "default" : "outline"} 
                    className="cursor-pointer hover:bg-gray-100" 
                    onClick={() => onTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Selected tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map(tag => (
                      <Badge key={tag} variant="default" className="text-xs">
                        {tag}
                        <button 
                          onClick={() => onTagToggle(tag)}
                          className="ml-1 hover:bg-red-600 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="isbn">ISBN (Optional)</Label>
            <Input id="isbn" placeholder="Enter ISBN number" value={formData.isbn} onChange={e => onInputChange('isbn', e.target.value)} className="focus:border-black focus:ring-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookDetailsStep;
