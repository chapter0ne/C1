
-- Create book cover storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true);

-- Create storage policy for book covers
CREATE POLICY "Anyone can view book covers" ON storage.objects
FOR SELECT USING (bucket_id = 'book-covers');

CREATE POLICY "Authenticated users can upload book covers" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'book-covers' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their book covers" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'book-covers' AND 
  auth.role() = 'authenticated'
);

-- Add missing columns to books table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='books' AND column_name='tags') THEN
    ALTER TABLE books ADD COLUMN tags TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='books' AND column_name='cover_image_url') THEN
    ALTER TABLE books ADD COLUMN cover_image_url TEXT;
  END IF;
END $$;

-- Update books table RLS policies to be more specific for admin vs reader access
DROP POLICY IF EXISTS "Everyone can view published books" ON books;
DROP POLICY IF EXISTS "Admins can manage all books" ON books;

-- Admins can do everything with books
CREATE POLICY "Admins can manage all books" ON books
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Readers can only view published books
CREATE POLICY "Readers can view published books" ON books
FOR SELECT USING (
  status = 'published'::book_status OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update book_chapters RLS policies
DROP POLICY IF EXISTS "Users can view chapters of owned/purchased books" ON book_chapters;
DROP POLICY IF EXISTS "Admins can manage chapters" ON book_chapters;

-- Admins can manage all chapters
CREATE POLICY "Admins can manage all chapters" ON book_chapters
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Readers can view chapters of published books (free) or purchased books
CREATE POLICY "Readers can view accessible chapters" ON book_chapters
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM books b 
    WHERE b.id = book_chapters.book_id 
    AND (
      (b.status = 'published'::book_status AND b.is_free = true) OR
      EXISTS (
        SELECT 1 FROM book_purchases bp 
        WHERE bp.book_id = b.id AND bp.user_id = auth.uid()
      )
    )
  )
);
