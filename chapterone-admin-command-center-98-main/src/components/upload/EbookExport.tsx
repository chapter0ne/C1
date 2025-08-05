
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateAndDownloadEbook } from "@/utils/ebookGenerator";
import { Chapter } from "@/types/chapter";

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

interface EbookExportProps {
  formData: FormData;
  chapters: Chapter[];
  coverImageUrl?: string;
}

const EbookExport = ({ formData, chapters, coverImageUrl }: EbookExportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportEbook = async () => {
    if (chapters.length === 0) {
      toast.error("Cannot export ebook without chapters");
      return;
    }

    if (!formData.title || !formData.author) {
      toast.error("Book title and author are required for export");
      return;
    }

    setIsExporting(true);
    
    try {
      await generateAndDownloadEbook({
        formData,
        chapters,
        coverImageUrl
      });
      
      toast.success("Ebook exported successfully!");
    } catch (error) {
      console.error("Error exporting ebook:", error);
      toast.error("Failed to export ebook. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExportEbook}
      disabled={isExporting || chapters.length === 0}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export Ebook
        </>
      )}
    </Button>
  );
};

export default EbookExport;
