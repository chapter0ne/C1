
-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'reader');
CREATE TYPE public.book_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.reading_status AS ENUM ('not_started', 'reading', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'reader',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  isbn TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,
  status book_status DEFAULT 'draft',
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create book_chapters table
CREATE TABLE public.book_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  chapter_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, chapter_order)
);

-- Create book_purchases table
CREATE TABLE public.book_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Create book_reviews table
CREATE TABLE public.book_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Create user_libraries table (books owned by user)
CREATE TABLE public.user_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  reading_status reading_status DEFAULT 'not_started',
  started_reading_at TIMESTAMP WITH TIME ZONE,
  completed_reading_at TIMESTAMP WITH TIME ZONE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Create user_wishlists table
CREATE TABLE public.user_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Create user_follows table (users following other users)
CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Create reading_lists table
CREATE TABLE public.reading_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reading_list_books table (books in a reading list)
CREATE TABLE public.reading_list_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_list_id UUID REFERENCES public.reading_lists(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  book_order INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reading_list_id, book_id),
  UNIQUE(reading_list_id, book_order)
);

-- Create reading_list_follows table (users following reading lists)
CREATE TABLE public.reading_list_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reading_list_id UUID REFERENCES public.reading_lists(id) ON DELETE CASCADE NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reading_list_id)
);

-- Create reading_list_completions table (users who completed reading lists)
CREATE TABLE public.reading_list_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reading_list_id UUID REFERENCES public.reading_lists(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reading_list_id)
);

-- Create reading_list_comments table
CREATE TABLE public.reading_list_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reading_list_id UUID REFERENCES public.reading_lists(id) ON DELETE CASCADE NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_list_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_list_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_list_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_list_comments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  
  -- Assign default reader role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'reader');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for books
CREATE POLICY "Everyone can view published books" ON public.books FOR SELECT USING (status = 'published' OR created_by = auth.uid());
CREATE POLICY "Admins can manage all books" ON public.books FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for book_chapters
CREATE POLICY "Users can view chapters of owned/purchased books" ON public.book_chapters FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.books b 
    WHERE b.id = book_id 
    AND (b.is_free = true OR b.created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.book_purchases bp 
      WHERE bp.book_id = b.id AND bp.user_id = auth.uid()
    ))
  )
);
CREATE POLICY "Admins can manage chapters" ON public.book_chapters FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for book_purchases
CREATE POLICY "Users can view own purchases" ON public.book_purchases FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create purchases" ON public.book_purchases FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all purchases" ON public.book_purchases FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for book_reviews
CREATE POLICY "Everyone can view reviews" ON public.book_reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage own reviews" ON public.book_reviews FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all reviews" ON public.book_reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_libraries
CREATE POLICY "Users can view own library" ON public.user_libraries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own library" ON public.user_libraries FOR ALL USING (user_id = auth.uid());

-- RLS Policies for user_wishlists
CREATE POLICY "Users can view own wishlist" ON public.user_wishlists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own wishlist" ON public.user_wishlists FOR ALL USING (user_id = auth.uid());

-- RLS Policies for user_follows
CREATE POLICY "Everyone can view follows" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.user_follows FOR ALL USING (follower_id = auth.uid());

-- RLS Policies for reading_lists
CREATE POLICY "Everyone can view public reading lists" ON public.reading_lists FOR SELECT USING (is_public = true OR creator_id = auth.uid());
CREATE POLICY "Users can manage own reading lists" ON public.reading_lists FOR ALL USING (creator_id = auth.uid());

-- RLS Policies for reading_list_books
CREATE POLICY "Users can view books in accessible lists" ON public.reading_list_books FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.reading_lists rl 
    WHERE rl.id = reading_list_id 
    AND (rl.is_public = true OR rl.creator_id = auth.uid())
  )
);
CREATE POLICY "List creators can manage list books" ON public.reading_list_books FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.reading_lists rl 
    WHERE rl.id = reading_list_id 
    AND rl.creator_id = auth.uid()
  )
);

-- RLS Policies for reading_list_follows
CREATE POLICY "Everyone can view list follows" ON public.reading_list_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own list follows" ON public.reading_list_follows FOR ALL USING (user_id = auth.uid());

-- RLS Policies for reading_list_completions
CREATE POLICY "Everyone can view list completions" ON public.reading_list_completions FOR SELECT USING (true);
CREATE POLICY "Users can manage own completions" ON public.reading_list_completions FOR ALL USING (user_id = auth.uid());

-- RLS Policies for reading_list_comments
CREATE POLICY "Everyone can view comments on public lists" ON public.reading_list_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.reading_lists rl 
    WHERE rl.id = reading_list_id 
    AND (rl.is_public = true OR rl.creator_id = auth.uid())
  )
);
CREATE POLICY "Users can create comments on public lists" ON public.reading_list_comments FOR INSERT WITH CHECK (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.reading_lists rl 
    WHERE rl.id = reading_list_id 
    AND rl.is_public = true
  )
);
CREATE POLICY "Users can manage own comments" ON public.reading_list_comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users and list creators can delete comments" ON public.reading_list_comments FOR DELETE USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.reading_lists rl 
    WHERE rl.id = reading_list_id 
    AND rl.creator_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_books_status ON public.books (status);
CREATE INDEX idx_books_genre ON public.books (genre);
CREATE INDEX idx_book_reviews_book_id ON public.book_reviews (book_id);
CREATE INDEX idx_book_reviews_rating ON public.book_reviews (rating);
CREATE INDEX idx_user_libraries_user_id ON public.user_libraries (user_id);
CREATE INDEX idx_user_libraries_reading_status ON public.user_libraries (reading_status);
CREATE INDEX idx_user_follows_follower ON public.user_follows (follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows (following_id);
CREATE INDEX idx_reading_lists_public ON public.reading_lists (is_public);
CREATE INDEX idx_reading_list_follows_list ON public.reading_list_follows (reading_list_id);
CREATE INDEX idx_reading_list_completions_list ON public.reading_list_completions (reading_list_id);
