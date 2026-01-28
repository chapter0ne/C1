/**
 * URL segment for a book (slug or id). Use for /book/:segment and /book/:segment/read.
 * Prefer slug when present so URLs are title-based and stable.
 */
export function getBookPath(book: { slug?: string; _id?: string; id?: string } | null | undefined): string {
  if (!book) return '';
  const slug = (book as any).slug;
  const id = (book as any)._id || (book as any).id;
  return (slug && String(slug).trim()) || (id && String(id)) || '';
}

export function bookDetailUrl(book: { slug?: string; _id?: string; id?: string } | null | undefined): string {
  const path = getBookPath(book);
  return path ? `/book/${path}` : '#';
}

export function bookReadUrl(book: { slug?: string; _id?: string; id?: string } | null | undefined): string {
  const path = getBookPath(book);
  return path ? `/book/${path}/read` : '#';
}

/** True if the string looks like a MongoDB ObjectId (24 hex chars). */
export function looksLikeObjectId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id || '');
}
