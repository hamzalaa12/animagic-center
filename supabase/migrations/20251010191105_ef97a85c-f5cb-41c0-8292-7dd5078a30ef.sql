-- Create user roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create anime table
CREATE TABLE public.anime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_arabic TEXT,
  description TEXT,
  cover_image TEXT,
  banner_image TEXT,
  type TEXT CHECK (type IN ('tv', 'movie', 'ova', 'special')),
  status TEXT CHECK (status IN ('ongoing', 'completed', 'upcoming')),
  release_year INTEGER,
  rating DECIMAL(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.anime ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view anime"
  ON public.anime FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage anime"
  ON public.anime FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create genres table
CREATE TABLE public.genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_arabic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view genres"
  ON public.genres FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage genres"
  ON public.genres FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create anime_genres junction table
CREATE TABLE public.anime_genres (
  anime_id UUID REFERENCES public.anime(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (anime_id, genre_id)
);

ALTER TABLE public.anime_genres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view anime genres"
  ON public.anime_genres FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage anime genres"
  ON public.anime_genres FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create seasons table
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id UUID REFERENCES public.anime(id) ON DELETE CASCADE NOT NULL,
  season_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_arabic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(anime_id, season_number)
);

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seasons"
  ON public.seasons FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage seasons"
  ON public.seasons FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create episodes table
CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_arabic TEXT,
  thumbnail TEXT,
  duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(season_id, episode_number)
);

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view episodes"
  ON public.episodes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage episodes"
  ON public.episodes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create video servers table
CREATE TABLE public.video_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE NOT NULL,
  server_name TEXT NOT NULL,
  video_url TEXT NOT NULL,
  quality TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.video_servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view video servers"
  ON public.video_servers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage video servers"
  ON public.video_servers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for anime table
CREATE TRIGGER update_anime_updated_at
  BEFORE UPDATE ON public.anime
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default genres
INSERT INTO public.genres (name, name_arabic) VALUES
  ('Action', 'أكشن'),
  ('Adventure', 'مغامرة'),
  ('Comedy', 'كوميديا'),
  ('Drama', 'دراما'),
  ('Fantasy', 'خيالي'),
  ('Romance', 'رومانسي'),
  ('Sci-Fi', 'خيال علمي'),
  ('Thriller', 'إثارة'),
  ('Horror', 'رعب'),
  ('Slice of Life', 'شريحة من الحياة');