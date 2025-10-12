-- Create manga table
CREATE TABLE IF NOT EXISTS public.manga (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_arabic TEXT,
  description TEXT,
  cover_image TEXT,
  banner_image TEXT,
  type TEXT DEFAULT 'manga',
  status TEXT,
  release_year INTEGER,
  rating NUMERIC,
  author TEXT,
  artist TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create manga_chapters table
CREATE TABLE IF NOT EXISTS public.manga_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manga_id UUID NOT NULL REFERENCES public.manga(id) ON DELETE CASCADE,
  chapter_number NUMERIC NOT NULL,
  title TEXT NOT NULL,
  title_arabic TEXT,
  thumbnail TEXT,
  release_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create manga_pages table
CREATE TABLE IF NOT EXISTS public.manga_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.manga_chapters(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create manga_genres junction table
CREATE TABLE IF NOT EXISTS public.manga_genres (
  manga_id UUID NOT NULL REFERENCES public.manga(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (manga_id, genre_id)
);

-- Create scraper_sources table to manage scraping websites
CREATE TABLE IF NOT EXISTS public.scraper_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('anime', 'manga')),
  is_active BOOLEAN DEFAULT true,
  selectors JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraper_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for manga
CREATE POLICY "Anyone can view manga" ON public.manga FOR SELECT USING (true);
CREATE POLICY "Admins can manage manga" ON public.manga FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for manga_chapters
CREATE POLICY "Anyone can view manga chapters" ON public.manga_chapters FOR SELECT USING (true);
CREATE POLICY "Admins can manage manga chapters" ON public.manga_chapters FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for manga_pages
CREATE POLICY "Anyone can view manga pages" ON public.manga_pages FOR SELECT USING (true);
CREATE POLICY "Admins can manage manga pages" ON public.manga_pages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for manga_genres
CREATE POLICY "Anyone can view manga genres" ON public.manga_genres FOR SELECT USING (true);
CREATE POLICY "Admins can manage manga genres" ON public.manga_genres FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for scraper_sources
CREATE POLICY "Anyone can view active scraper sources" ON public.scraper_sources FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage scraper sources" ON public.scraper_sources FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for manga updated_at
CREATE TRIGGER update_manga_updated_at
BEFORE UPDATE ON public.manga
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for scraper_sources updated_at
CREATE TRIGGER update_scraper_sources_updated_at
BEFORE UPDATE ON public.scraper_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default scraper sources
INSERT INTO public.scraper_sources (name, url, type, selectors) VALUES
  ('AnimeRCO', 'https://animerco.org', 'anime', '{"title": ".anime-title", "description": ".anime-description"}'::jsonb),
  ('AzoraMoon', 'https://azoramoon.com', 'manga', '{"title": ".manga-title", "description": ".manga-description"}'::jsonb)
ON CONFLICT DO NOTHING;