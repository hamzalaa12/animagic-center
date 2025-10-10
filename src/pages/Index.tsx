import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
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

const Index = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnime();
  }, []);

  const fetchAnime = async () => {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12);

    if (!error && data) {
      setAnimeList(data);
    }
    setLoading(false);
  };

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
              شاهد أحدث حلقات الأنمي المفضلة لديك مع أفضل جودة
            </p>
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary gap-2 text-lg px-8">
              <Play className="h-6 w-6" />
              ابدأ المشاهدة
            </Button>
          </div>
        </div>
      </section>

      {/* Anime Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 gradient-text">أحدث الإضافات</h2>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : animeList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {animeList.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                title={anime.title}
                titleArabic={anime.title_arabic || undefined}
                coverImage={anime.cover_image || undefined}
                rating={anime.rating || undefined}
                type={anime.type || undefined}
                status={anime.status || undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">لا توجد عناصر حالياً</p>
            <p className="text-muted-foreground mt-2">قم بإضافة بعض الأنمي من لوحة التحكم</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
