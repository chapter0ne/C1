
import { useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ content, onChange, placeholder = "Write your chapter content here...", className = "" }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Save cursor position
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      const range = selection.getRangeAt(0);
      return {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset
      };
    }
    return null;
  }, []);

  // Restore cursor position
  const restoreCursorPosition = useCallback((savedPosition: any) => {
    if (savedPosition && editorRef.current) {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(savedPosition.startContainer, savedPosition.startOffset);
        range.setEnd(savedPosition.endContainer, savedPosition.endOffset);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } catch (error) {
        // If restoration fails, place cursor at end
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      const savedPosition = saveCursorPosition();
      editorRef.current.innerHTML = content || `<p style="color: #999; font-style: italic;">${placeholder}</p>`;
      
      // Only restore position if we have actual content
      if (content && savedPosition) {
        setTimeout(() => restoreCursorPosition(savedPosition), 0);
      }
    }
  }, [content, placeholder, saveCursorPosition, restoreCursorPosition]);

  const handleInput = () => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      // Check if content is just the placeholder
      const placeholderPattern = new RegExp(`<p style="color: #999; font-style: italic;">${placeholder}</p>`);
      if (placeholderPattern.test(currentContent)) {
        onChange('');
      } else {
        onChange(currentContent);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    let pastedContent = '';
    
    // Try to get HTML content first (preserves formatting)
    if (clipboardData.types.includes('text/html')) {
      pastedContent = clipboardData.getData('text/html');
    } else {
      // Fallback to plain text
      const plainText = clipboardData.getData('text/plain');
      pastedContent = plainText.replace(/\n/g, '<br>');
    }
    
    // Insert the pasted content at cursor position
    document.execCommand('insertHTML', false, pastedContent);
    
    setTimeout(() => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }, 0);
  };

  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle backspace to prevent cursor jumping
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection && editorRef.current) {
        // If we're at the beginning of the content and it would cause navigation, prevent it
        const range = selection.getRangeAt(0);
        if (range.startOffset === 0 && range.endOffset === 0) {
          const firstChild = editorRef.current.firstChild;
          if (firstChild && range.startContainer === firstChild) {
            // We're at the very beginning, let the default behavior handle it
            // but ensure we don't navigate away from the page
            if (editorRef.current.textContent?.trim() === '' || 
                editorRef.current.innerHTML === '' ||
                editorRef.current.innerHTML.includes(placeholder)) {
              e.preventDefault();
              return;
            }
          }
        }
      }
    }

    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          applyFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormatting('italic');
          break;
        case 'u':
          e.preventDefault();
          applyFormatting('underline');
          break;
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    // Clear placeholder when focused
    if (e.target.innerHTML.includes(placeholder)) {
      e.target.innerHTML = '';
      onChange('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Add placeholder back if empty
    if (!e.target.innerHTML.trim() || e.target.innerHTML.trim() === '<br>') {
      e.target.innerHTML = `<p style="color: #999; font-style: italic;">${placeholder}</p>`;
    }
  };

  return (
    <div className={`flex flex-col space-y-2 h-full ${className}`}>
      <div className="flex gap-2 mb-2 flex-wrap border-b pb-2 flex-shrink-0">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('underline')}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('justifyLeft')}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('justifyCenter')}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('justifyRight')}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyFormatting('justifyFull')}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="flex-1 min-h-0 p-6 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-pre-wrap break-words overflow-y-auto"
        style={{ 
          fontFamily: 'Georgia, serif',
          lineHeight: '1.6',
          fontSize: '16px'
        }}
      />
    </div>
  );
};

export default RichTextEditor;
