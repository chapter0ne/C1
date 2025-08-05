
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Chapter } from "@/types/chapter";
import EbookExport from "./EbookExport";

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

interface BookPreviewProps {
  formData: FormData;
  chapters: Chapter[];
  onClose: () => void;
  coverImageUrl?: string;
}

const BookPreview = ({ formData, chapters, onClose, coverImageUrl }: BookPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  // Total pages: cover + title page + chapters
  const totalPages = 2 + chapters.length;

  const renderCurrentPage = () => {
    if (currentPage === 0) {
      // Cover page
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          {coverImageUrl ? (
            <img 
              src={coverImageUrl} 
              alt="Book cover" 
              className="max-h-96 max-w-full object-contain mb-4 rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-64 h-96 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
              <span className="text-gray-500">No Cover Image</span>
            </div>
          )}
        </div>
      );
    } else if (currentPage === 1) {
      // Title page - using Archivo font
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 font-archivo">
          <h1 className="text-4xl font-bold text-gray-900">{formData.title}</h1>
          <p className="text-xl text-gray-600">by {formData.author}</p>
          {formData.description && (
            <p className="text-gray-700 max-w-lg leading-relaxed">{formData.description}</p>
          )}
        </div>
      );
    } else {
      // Chapter pages - using serif font for reading content
      const chapterIndex = currentPage - 2;
      const chapter = chapters[chapterIndex];
      
      return (
        <div className="h-full overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 font-archivo">{chapter.title}</h2>
          <div 
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
            style={{ fontFamily: 'Georgia, serif', lineHeight: '1.7' }}
            dangerouslySetInnerHTML={{ __html: chapter.content }}
          />
        </div>
      );
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-11/12 h-5/6 max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Book Preview</CardTitle>
            <div className="flex items-center gap-2">
              <EbookExport 
                formData={formData}
                chapters={chapters}
                coverImageUrl={coverImageUrl}
              />
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-full flex flex-col">
          <div className="flex-1 bg-white p-8 border rounded-lg overflow-hidden">
            {renderCurrentPage()}
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={prevPage} 
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <Button 
              variant="outline" 
              onClick={nextPage} 
              disabled={currentPage === totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookPreview;
