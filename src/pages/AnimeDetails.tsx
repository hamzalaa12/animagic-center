import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Star } from "lucide-react";

interface Anime {
  id: string;
  title: string;
  title_arabic: string | null;
  description: string | null;
  cover_image: string | null;
  banner_image: string | null;
  type: string | null;
  status: string | null;
  release_year: number | null;
  rating: number | null;
}

interface Season {
  id: string;
  season_number: number;
  title: string;
  title_arabic: string | null;
}

interface Episode {
  id: string;
  episode_number: number;
  title: string;
  title_arabic: string | null;
  thumbnail: string | null;
}

const AnimeDetails = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAnimeDetails();
    }
  }, [id]);

  useEffect(() => {
    if (selectedSeason) {
      fetchEpisodes(selectedSeason);
    }
  }, [selectedSeason]);

  const fetchAnimeDetails = async () => {
    if (!id) return;

    const { data: animeData } = await supabase
      .from('anime')
      .select('*')
      .eq('id', id)
      .single();

    if (animeData) {
      setAnime(animeData);
    }

    const { data: seasonsData } = await supabase
      .from('seasons')
      .select('*')
      .eq('anime_id', id)
      .order('season_number', { ascending: true });

    if (seasonsData && seasonsData.length > 0) {
      setSeasons(seasonsData);
      setSelectedSeason(seasonsData[0].id);
    }

    setLoading(false);
  };

  const fetchEpisodes = async (seasonId: string) => {
    const { data } = await supabase
      .from('episodes')
      .select('*')
      .eq('season_id', seasonId)
      .order('episode_number', { ascending: true });

    if (data) {
      setEpisodes(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold">لم يتم العثور على الأنمي</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Banner Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <img
          src={anime.banner_image || anime.cover_image || "https://placehold.co/1920x1080/1a1a2e/8b5cf6?text=Banner"}
          alt={anime.title_arabic || anime.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </section>

      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            <img
              src={anime.cover_image || "https://placehold.co/400x600/1a1a2e/8b5cf6?text=Cover"}
              alt={anime.title_arabic || anime.title}
              className="w-64 rounded-lg shadow-2xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{anime.title_arabic || anime.title}</h1>
              {anime.title_arabic && (
                <p className="text-xl text-muted-foreground">{anime.title}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {anime.type && (
                <Badge variant="secondary">
                  {anime.type === 'tv' ? 'مسلسل' : anime.type === 'movie' ? 'فيلم' : anime.type}
                </Badge>
              )}
              {anime.status && (
                <Badge>
                  {anime.status === 'ongoing' ? 'مستمر' : anime.status === 'completed' ? 'مكتمل' : 'قريباً'}
                </Badge>
              )}
              {anime.release_year && (
                <Badge variant="outline">{anime.release_year}</Badge>
              )}
              {anime.rating && (
                <Badge className="gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {anime.rating}
                </Badge>
              )}
            </div>

            {anime.description && (
              <p className="text-muted-foreground leading-relaxed">{anime.description}</p>
            )}
          </div>
        </div>

        {/* Seasons and Episodes */}
        <div className="mt-12">
          <Tabs value={selectedSeason || undefined} onValueChange={setSelectedSeason}>
            <TabsList className="mb-6">
              {seasons.map((season) => (
                <TabsTrigger key={season.id} value={season.id}>
                  الموسم {season.season_number}
                </TabsTrigger>
              ))}
            </TabsList>

            {seasons.map((season) => (
              <TabsContent key={season.id} value={season.id}>
                <h3 className="text-2xl font-bold mb-6">
                  {season.title_arabic || season.title}
                </h3>
                
                {episodes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {episodes.map((episode) => (
                      <Link key={episode.id} to={`/watch/${episode.id}`}>
                        <Card className="anime-card-hover overflow-hidden glass-effect group">
                          <div className="relative aspect-video">
                            <img
                              src={episode.thumbnail || anime.cover_image || "https://placehold.co/640x360/1a1a2e/8b5cf6?text=Episode"}
                              alt={`Episode ${episode.episode_number}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Play className="h-12 w-12 text-primary" />
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold">الحلقة {episode.episode_number}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {episode.title_arabic || episode.title}
                            </p>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">لا توجد حلقات متاحة حالياً</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
