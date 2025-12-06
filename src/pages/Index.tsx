import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, BookOpen, Film, TrendingUp, Star, Clock } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

interface Anime {
  id: string;
  title: string;
  title_arabic: string | null;
  cover_image: string | null;
  rating: number | null;
  type: string | null;
  status: string | null;
}

interface Manga {
  id: string;
  title: string;
  title_arabic: string | null;
  cover_image: string | null;
  rating: number | null;
  type: string | null;
  status: string | null;
}

const Index = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const [animeRes, mangaRes, trendingRes] = await Promise.all([
      supabase.from('anime').select('*').order('created_at', { ascending: false }).limit(12),
      supabase.from('manga').select('*').order('created_at', { ascending: false }).limit(12),
      supabase.from('anime').select('*').order('rating', { ascending: false }).limit(6)
    ]);

    if (animeRes.data) setAnimeList(animeRes.data);
    if (mangaRes.data) setMangaList(mangaRes.data);
    if (trendingRes.data) setTrendingAnime(trendingRes.data);
    setLoading(false);
  };

  const ContentGrid = ({ items, type }: { items: (Anime | Manga)[]; type: 'anime' | 'manga' }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {items.map((item) => (
        <AnimeCard
          key={item.id}
          id={item.id}
          title={item.title}
          titleArabic={item.title_arabic || undefined}
          coverImage={item.cover_image || undefined}
          rating={item.rating || undefined}
          type={item.type || undefined}
          status={item.status || undefined}
          linkPrefix={type === 'manga' ? '/manga' : '/anime'}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <img
          src={heroBanner}
          alt="Hero Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex items-end pb-20">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text">
              مرحباً بك في AnimeStream
            </h1>
            <p className="text-xl text-muted-foreground">
              شاهد أحدث حلقات الأنمي واقرأ أفضل المانجا بأفضل جودة
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/anime">
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary gap-2 text-lg px-8">
                  <Play className="h-6 w-6" />
                  شاهد الأنمي
                </Button>
              </Link>
              <Link to="/manga">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 border-primary/50 hover:bg-primary/10">
                  <BookOpen className="h-6 w-6" />
                  اقرأ المانجا
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {trendingAnime.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold gradient-text">الأكثر شعبية</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {trendingAnime.map((anime, index) => (
              <div key={anime.id} className="relative group">
                <div className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                <AnimeCard
                  id={anime.id}
                  title={anime.title}
                  titleArabic={anime.title_arabic || undefined}
                  coverImage={anime.cover_image || undefined}
                  rating={anime.rating || undefined}
                  type={anime.type || undefined}
                  status={anime.status || undefined}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content Tabs */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="anime" className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="anime" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Film className="h-4 w-4" />
                أحدث الأنمي
              </TabsTrigger>
              <TabsTrigger value="manga" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BookOpen className="h-4 w-4" />
                أحدث المانجا
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Link to="/anime">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  عرض الكل
                </Button>
              </Link>
            </div>
          </div>

          <TabsContent value="anime">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : animeList.length > 0 ? (
              <ContentGrid items={animeList} type="anime" />
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl">
                <Film className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-2xl text-muted-foreground">لا توجد أنميات حالياً</p>
                <p className="text-muted-foreground mt-2">قم بإضافة بعض الأنمي من لوحة التحكم</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manga">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : mangaList.length > 0 ? (
              <ContentGrid items={mangaList} type="manga" />
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-2xl text-muted-foreground">لا توجد مانجا حالياً</p>
                <p className="text-muted-foreground mt-2">قم بإضافة بعض المانجا من لوحة التحكم</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl border border-primary/20">
            <Film className="h-10 w-10 mx-auto mb-3 text-primary" />
            <p className="text-3xl font-bold">{animeList.length}+</p>
            <p className="text-muted-foreground">أنمي</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-secondary/20 to-transparent rounded-2xl border border-secondary/20">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-secondary" />
            <p className="text-3xl font-bold">{mangaList.length}+</p>
            <p className="text-muted-foreground">مانجا</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-accent/20 to-transparent rounded-2xl border border-accent/20">
            <Star className="h-10 w-10 mx-auto mb-3 text-accent" />
            <p className="text-3xl font-bold">HD</p>
            <p className="text-muted-foreground">جودة عالية</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-muted/40 to-transparent rounded-2xl border border-muted">
            <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-muted-foreground">متاح دائماً</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
