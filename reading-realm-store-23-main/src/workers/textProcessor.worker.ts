// Web Worker for text processing operations
// This runs in a separate thread to avoid blocking the main UI

interface TextProcessingMessage {
  type: 'FORMAT_TEXT' | 'SEARCH_TEXT' | 'ANALYZE_TEXT';
  data: any;
  id: string;
}

interface TextProcessingResult {
  type: string;
  data: any;
  id: string;
  processingTime: number;
}

// Text formatting functions
const formatText = (text: string): string => {
  if (!text) return '';

  try {
    let formattedText = text;

    // Convert **bold** to <strong>
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert _underline_ to <u>
    formattedText = formattedText.replace(/_(.*?)_/g, '<u>$1</u>');

    // Convert line breaks to <br>
    formattedText = formattedText.replace(/\n/g, '<br>');

    // Remove inline styles that might interfere with reading settings
    formattedText = formattedText.replace(/style="[^"]*"/gi, '');
    formattedText = formattedText.replace(/style='[^']*'/gi, '');

    return formattedText;
  } catch (error) {
    console.warn('Error formatting text:', error);
    return text;
  }
};

// Text search with highlighting
const searchText = (text: string, searchTerm: string): { matches: number; highlightedText: string } => {
  if (!text || !searchTerm) {
    return { matches: 0, highlightedText: text };
  }

  try {
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const highlightedText = text.replace(regex, '<mark>$1</mark>');
    const matches = (text.match(regex) || []).length;

    return { matches, highlightedText };
  } catch (error) {
    console.warn('Error searching text:', error);
    return { matches: 0, highlightedText: text };
  }
};

// Text analysis
const analyzeText = (text: string) => {
  if (!text) {
    return {
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      readingTime: 0,
      complexity: 'low'
    };
  }

  try {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;
    
    // Estimate reading time (average 200 words per minute)
    const readingTime = Math.ceil(words.length / 200);
    
    // Simple complexity calculation based on average word length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    let complexity = 'low';
    if (avgWordLength > 8) complexity = 'high';
    else if (avgWordLength > 6) complexity = 'medium';

    return {
      wordCount: words.length,
      characterCount: characters,
      sentenceCount: sentences,
      paragraphCount: paragraphs,
      readingTime,
      complexity
    };
  } catch (error) {
    console.warn('Error analyzing text:', error);
    return {
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      readingTime: 0,
      complexity: 'low'
    };
  }
};

// Main message handler
self.addEventListener('message', (event: MessageEvent<TextProcessingMessage>) => {
  const { type, data, id } = event.data;
  const startTime = performance.now();
  
  let result: any;
  
  try {
    switch (type) {
      case 'FORMAT_TEXT':
        result = formatText(data.text);
        break;
        
      case 'SEARCH_TEXT':
        result = searchText(data.text, data.searchTerm);
        break;
        
      case 'ANALYZE_TEXT':
        result = analyzeText(data.text);
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
    
    const processingTime = performance.now() - startTime;
    
    const response: TextProcessingResult = {
      type,
      data: result,
      id,
      processingTime
    };
    
    self.postMessage(response);
    
  } catch (error) {
    const processingTime = performance.now() - startTime;
    
    const errorResponse: TextProcessingResult = {
      type,
      data: { error: error.message },
      id,
      processingTime
    };
    
    self.postMessage(errorResponse);
  }
});

// Handle worker errors
self.addEventListener('error', (error) => {
  console.error('Text processing worker error:', error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('Text processing worker unhandled rejection:', event.reason);
});

