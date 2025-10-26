
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
  coverImageUrl?: string; // Add this field for existing cover images
  authorSocials?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}

interface BookDetailsStepProps {
  formData: FormData;
  selectedTags: string[];
  coverImageUrl?: string | null; // Add this prop for existing cover images
  onInputChange: (field: string, value: string | boolean | File | { instagram?: string; twitter?: string; tiktok?: string }) => void;
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

  // Debug: Show current form data
  console.log('BookDetailsStep render - formData:', formData);
  console.log('BookDetailsStep render - selectedTags:', selectedTags);
  console.log('BookDetailsStep render - coverImageUrl:', coverImageUrl);

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
          
          {/* Author Social Media Links */}
          <div>
            <Label>Author Social Media (Optional)</Label>
            <div className="space-y-3 mt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-20">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="text-sm font-medium">Instagram</span>
                </div>
                <Input 
                  placeholder="username (e.g., niji)" 
                  value={formData.authorSocials?.instagram || ''} 
                  onChange={e => onInputChange('authorSocials', { ...formData.authorSocials, instagram: e.target.value })}
                  className="focus:border-black focus:ring-0"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-20">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="text-sm font-medium">Twitter</span>
                </div>
                <Input 
                  placeholder="username (e.g., niji)" 
                  value={formData.authorSocials?.twitter || ''} 
                  onChange={e => onInputChange('authorSocials', { ...formData.authorSocials, twitter: e.target.value })}
                  className="focus:border-black focus:ring-0"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-20">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  <span className="text-sm font-medium">TikTok</span>
                </div>
                <Input 
                  placeholder="username (e.g., niji)" 
                  value={formData.authorSocials?.tiktok || ''} 
                  onChange={e => onInputChange('authorSocials', { ...formData.authorSocials, tiktok: e.target.value })}
                  className="focus:border-black focus:ring-0"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter just the username without @ symbol. Links will be automatically generated.</p>
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
