
export const formatText = (text: string): string => {
  if (!text) return '';

  let formattedText = text;

  // Convert **bold** to <strong>
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to <em>
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert _underline_ to <u>
  formattedText = formattedText.replace(/_(.*?)_/g, '<u>$1</u>');

  // Convert line breaks to <br>
  formattedText = formattedText.replace(/\n/g, '<br>');

  return formattedText;
};

export const stripHtmlTags = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};
