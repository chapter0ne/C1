
export const formatText = (text: string): string => {
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
    // This ensures the CSS settings can override any embedded styles
    formattedText = formattedText.replace(/style="[^"]*"/gi, '');
    formattedText = formattedText.replace(/style='[^']*'/gi, '');

    return formattedText;
  } catch (error) {
    console.warn('Error formatting text:', error);
    return text; // Return original text if formatting fails
  }
};

export const stripHtmlTags = (html: string): string => {
  try {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body?.textContent || '';
  } catch (error) {
    console.warn('Error stripping HTML tags:', error);
    return html; // Return original HTML if parsing fails
  }
};
