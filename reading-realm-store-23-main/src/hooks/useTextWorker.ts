import { useRef, useCallback, useMemo } from 'react';

interface TextWorkerMessage {
  type: 'FORMAT_TEXT' | 'SEARCH_TEXT' | 'ANALYZE_TEXT';
  data: any;
  id: string;
}

interface TextWorkerResult {
  type: string;
  data: any;
  id: string;
  processingTime: number;
}

interface UseTextWorkerReturn {
  formatText: (text: string) => Promise<string>;
  searchText: (text: string, searchTerm: string) => Promise<{ matches: number; highlightedText: string }>;
  analyzeText: (text: string) => Promise<any>;
  isWorkerReady: boolean;
  terminateWorker: () => void;
}

export const useTextWorker = (): UseTextWorkerReturn => {
  const workerRef = useRef<Worker | null>(null);
  const pendingRequestsRef = useRef<Map<string, { resolve: (value: any) => void; reject: (error: any) => void }>>(new Map());

  // Initialize worker
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      try {
        // Create worker with proper error handling
        if (typeof Worker !== 'undefined') {
          workerRef.current = new Worker(
            new URL('../workers/textProcessor.worker.ts', import.meta.url),
            { type: 'module' }
          );

          // Set up message handler
          workerRef.current.onmessage = (event: MessageEvent<TextWorkerResult>) => {
            const { id, data, type } = event.data;
            const pendingRequest = pendingRequestsRef.current.get(id);
            
            if (pendingRequest) {
              pendingRequestsRef.current.delete(id);
              if (data.error) {
                pendingRequest.reject(new Error(data.error));
              } else {
                pendingRequest.resolve(data);
              }
            }
          };

          // Set up error handler
          workerRef.current.onerror = (error) => {
            console.error('Text worker error:', error);
            // Reject all pending requests
            pendingRequestsRef.current.forEach(({ reject }) => {
              reject(new Error('Worker error'));
            });
            pendingRequestsRef.current.clear();
          };
        } else {
          console.warn('Web Workers not supported in this environment');
          return null;
        }
      } catch (error) {
        console.error('Failed to create text worker:', error);
        return null;
      }
    }
    return workerRef.current;
  }, []);

  // Generate unique ID for requests
  const generateId = useCallback(() => {
    return `text-worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Send message to worker
  const sendMessage = useCallback(async <T>(message: TextWorkerMessage): Promise<T> => {
    const worker = getWorker();
    if (!worker) {
      throw new Error('Text worker not available');
    }

    return new Promise<T>((resolve, reject) => {
      const id = generateId();
      const messageWithId = { ...message, id };
      
      // Store pending request
      pendingRequestsRef.current.set(id, { resolve, reject });
      
      // Send message to worker
      worker.postMessage(messageWithId);
      
      // Set timeout for request
      setTimeout(() => {
        if (pendingRequestsRef.current.has(id)) {
          pendingRequestsRef.current.delete(id);
          reject(new Error('Text processing timeout'));
        }
      }, 10000); // 10 second timeout
    });
  }, [getWorker, generateId]);

  // Format text using worker
  const formatText = useCallback(async (text: string): Promise<string> => {
    try {
      const worker = getWorker();
      if (!worker) {
        // Fallback to main thread if worker not available
        return formatTextFallback(text);
      }

      const result = await sendMessage({
        type: 'FORMAT_TEXT',
        data: { text },
        id: ''
      });
      return result as string;
    } catch (error) {
      console.warn('Worker formatting failed, falling back to main thread:', error);
      // Fallback to main thread processing
      return formatTextFallback(text);
    }
  }, [sendMessage, getWorker]);

  // Search text using worker
  const searchText = useCallback(async (text: string, searchTerm: string): Promise<{ matches: number; highlightedText: string }> => {
    try {
      const worker = getWorker();
      if (!worker) {
        // Fallback to main thread if worker not available
        return searchTextFallback(text, searchTerm);
      }

      const result = await sendMessage({
        type: 'SEARCH_TEXT',
        data: { text, searchTerm },
        id: ''
      });
      return result as { matches: number; highlightedText: string };
    } catch (error) {
      console.warn('Worker search failed, falling back to main thread:', error);
      // Fallback to main thread processing
      return searchTextFallback(text, searchTerm);
    }
  }, [sendMessage, getWorker]);

  // Analyze text using worker
  const analyzeText = useCallback(async (text: string): Promise<any> => {
    try {
      const worker = getWorker();
      if (!worker) {
        // Fallback to main thread if worker not available
        return analyzeTextFallback(text);
      }

      const result = await sendMessage({
        type: 'ANALYZE_TEXT',
        data: { text },
        id: ''
      });
      return result;
    } catch (error) {
      console.warn('Worker analysis failed, falling back to main thread:', error);
      // Fallback to main thread processing
      return analyzeTextFallback(text);
    }
  }, [sendMessage, getWorker]);

  // Terminate worker
  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      // Reject all pending requests
      pendingRequestsRef.current.forEach(({ reject }) => {
        reject(new Error('Worker terminated'));
      });
      pendingRequestsRef.current.clear();
    }
  }, []);

  // Check if worker is ready
  const isWorkerReady = useMemo(() => {
    return workerRef.current !== null;
  }, []);

  // Fallback functions for main thread processing
  const formatTextFallback = (text: string): string => {
    if (!text) return '';
    
    let formattedText = text;
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText.replace(/_(.*?)_/g, '<u>$1</u>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/style="[^"]*"/gi, '');
    formattedText = formattedText.replace(/style='[^']*'/gi, '');
    
    return formattedText;
  };

  const searchTextFallback = (text: string, searchTerm: string): { matches: number; highlightedText: string } => {
    if (!text || !searchTerm) {
      return { matches: 0, highlightedText: text };
    }
    
    try {
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const highlightedText = text.replace(regex, '<mark>$1</mark>');
      const matches = (text.match(regex) || []).length;
      
      return { matches, highlightedText };
    } catch (error) {
      return { matches: 0, highlightedText: text };
    }
  };

  const analyzeTextFallback = (text: string) => {
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
      const readingTime = Math.ceil(words.length / 200);
      
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

  return {
    formatText,
    searchText,
    analyzeText,
    isWorkerReady,
    terminateWorker
  };
};
