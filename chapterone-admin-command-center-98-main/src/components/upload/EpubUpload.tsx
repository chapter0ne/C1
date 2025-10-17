import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface EpubUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
}

const EpubUpload: React.FC<EpubUploadProps> = ({ onFileSelect, selectedFile }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/epub+zip' || file.name.toLowerCase().endsWith('.epub'))) {
      onFileSelect(file);
      toast.success('EPUB file selected successfully!');
    } else {
      toast.error('Please select a valid EPUB file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/epub+zip' || file.name.toLowerCase().endsWith('.epub'))) {
      onFileSelect(file);
      toast.success('EPUB file selected successfully!');
    } else {
      toast.error('Please drop a valid EPUB file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = () => {
    onFileSelect(null as any);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Upload EPUB File</h3>
        <p className="text-muted-foreground">
          Select an EPUB file to upload. The file will be processed when you publish the book.
        </p>
      </div>

      {!selectedFile ? (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-center space-y-2">
              <h4 className="text-lg font-medium">Drop your EPUB file here</h4>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
            </div>
            <div className="mt-6">
              <Label htmlFor="epub-upload" className="cursor-pointer">
                <Button asChild>
                  <span>Choose EPUB File</span>
                </Button>
              </Label>
              <Input
                id="epub-upload"
                type="file"
                accept=".epub,application/epub+zip"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Supported formats: .epub</p>
              <p>Maximum size: 5GB</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              EPUB File Selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{selectedFile.name}</p>
                  <p className="text-sm text-green-600">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={removeFile}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ready for upload
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important:</p>
            <p>
              The EPUB file will be uploaded and processed when you click the "Publish" button. 
              Make sure all your book details and pricing are correct before publishing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpubUpload;