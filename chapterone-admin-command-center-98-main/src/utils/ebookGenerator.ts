
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

interface EbookData {
  formData: FormData;
  chapters: Chapter[];
  coverImageUrl?: string;
}

export const generateEbook = async (data: EbookData): Promise<string> => {
  const { formData, chapters, coverImageUrl } = data;
  
  // Sort chapters by creation date to maintain order
  const sortedChapters = [...chapters].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Generate table of contents
  const tableOfContents = sortedChapters
    .map((chapter, index) => 
      `<li><a href="#chapter-${index + 1}" style="text-decoration: none; color: #333;">${chapter.title}</a></li>`
    )
    .join('\n');

  // Generate chapter content
  const chaptersHtml = sortedChapters
    .map((chapter, index) => `
      <div class="chapter" id="chapter-${index + 1}" style="page-break-before: always; margin-bottom: 2em;">
        <h2 style="font-family: 'Georgia', serif; font-size: 2em; margin-bottom: 1em; color: #333; border-bottom: 2px solid #ddd; padding-bottom: 0.5em;">
          Chapter ${index + 1}: ${chapter.title}
        </h2>
        <div style="font-family: 'Georgia', serif; line-height: 1.8; font-size: 16px; color: #444;">
          ${chapter.content}
        </div>
      </div>
    `)
    .join('\n');

  // Create the complete ebook HTML
  const ebookHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formData.title} by ${formData.author}</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2em;
            color: #333;
            background: #fff;
        }
        
        .cover-page {
            text-align: center;
            page-break-after: always;
            padding: 4em 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .cover-image {
            max-width: 400px;
            max-height: 600px;
            margin: 0 auto 2em;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .title {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 0.5em;
            color: #222;
        }
        
        .author {
            font-size: 1.5em;
            color: #666;
            margin-bottom: 2em;
        }
        
        .description {
            font-size: 1.1em;
            line-height: 1.8;
            max-width: 600px;
            margin: 0 auto;
            text-align: left;
            color: #555;
        }
        
        .toc-page {
            page-break-before: always;
            page-break-after: always;
            padding: 2em 0;
        }
        
        .toc-title {
            font-size: 2.5em;
            text-align: center;
            margin-bottom: 2em;
            color: #333;
        }
        
        .toc-list {
            list-style: none;
            padding: 0;
        }
        
        .toc-list li {
            padding: 0.8em 0;
            border-bottom: 1px dotted #ccc;
            font-size: 1.2em;
        }
        
        .toc-list li:hover {
            background-color: #f9f9f9;
        }
        
        .chapter {
            margin-bottom: 3em;
        }
        
        .chapter h2 {
            font-size: 2.2em;
            margin-bottom: 1em;
            color: #333;
            border-bottom: 2px solid #ddd;
            padding-bottom: 0.5em;
        }
        
        .chapter-content {
            font-size: 16px;
            line-height: 1.8;
        }
        
        .book-info {
            page-break-before: always;
            text-align: center;
            padding: 2em;
            border-top: 2px solid #ddd;
            margin-top: 4em;
            color: #666;
        }
        
        @media print {
            body {
                padding: 1em;
            }
            
            .cover-page, .toc-page, .chapter {
                page-break-inside: avoid;
            }
        }
        
        @page {
            margin: 1in;
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        ${coverImageUrl ? `<img src="${coverImageUrl}" alt="Book Cover" class="cover-image">` : ''}
        <h1 class="title">${formData.title}</h1>
        <p class="author">by ${formData.author}</p>
        ${formData.description ? `<div class="description">${formData.description}</div>` : ''}
    </div>
    
    <!-- Table of Contents -->
    <div class="toc-page">
        <h2 class="toc-title">Table of Contents</h2>
        <ul class="toc-list">
            ${tableOfContents}
        </ul>
    </div>
    
    <!-- Chapters -->
    ${chaptersHtml}
    
    <!-- Book Information -->
    <div class="book-info">
        <h3>About This Book</h3>
        <p><strong>Title:</strong> ${formData.title}</p>
        <p><strong>Author:</strong> ${formData.author}</p>
        ${formData.genre ? `<p><strong>Genre:</strong> ${formData.genre}</p>` : ''}
        ${formData.isbn ? `<p><strong>ISBN:</strong> ${formData.isbn}</p>` : ''}
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>`;

  return ebookHtml;
};

export const downloadEbook = (ebookHtml: string, filename: string) => {
  const blob = new Blob([ebookHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateAndDownloadEbook = async (data: EbookData) => {
  const ebookHtml = await generateEbook(data);
  const filename = data.formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  downloadEbook(ebookHtml, filename);
};
