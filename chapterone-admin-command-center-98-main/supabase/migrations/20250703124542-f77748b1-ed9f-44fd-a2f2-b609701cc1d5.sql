
-- Create featured books table for best sellers and editor picks
CREATE TABLE public.featured_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('bestseller', 'editor_pick')),
  featured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  featured_by UUID REFERENCES public.profiles(id) NOT NULL,
  display_order INTEGER DEFAULT 0,
  UNIQUE(book_id, category)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  preview_text TEXT,
  action_url TEXT,
  target_audience TEXT NOT NULL,
  sent_by UUID REFERENCES public.profiles(id) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0
);

-- Create user notifications table to track individual notifications
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.featured_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for featured_books
CREATE POLICY "Everyone can view featured books" 
  ON public.featured_books 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage featured books" 
  ON public.featured_books 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for notifications
CREATE POLICY "Admins can manage notifications" 
  ON public.notifications 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view notifications sent to them" 
  ON public.notifications 
  FOR SELECT 
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.user_notifications un 
      WHERE un.notification_id = notifications.id 
      AND un.user_id = auth.uid()
    )
  );

-- RLS policies for user_notifications
CREATE POLICY "Users can view own notifications" 
  ON public.user_notifications 
  FOR SELECT 
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own notifications" 
  ON public.user_notifications 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user notifications" 
  ON public.user_notifications 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));
