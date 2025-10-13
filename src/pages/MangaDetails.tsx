import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Calendar, User, Palette, ArrowRight, Home } from "lucide-react";

interface MangaDetails {
  id: string;
  title: string;
  title_arabic: string | null;
  description: string | null;
  cover_image: string | null;
  banner_image: string | null;
  type: string;
  status: string | null;
  rating: number | null;
  author: string | null;
  artist: string | null;
  release_year: number | null;
}

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  title_arabic: string | null;
  release_date: string | null;
}

interface Genre {
  id: string;
  name: string;
  name_arabic: string | null;
}

export default function MangaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState<MangaDetails | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMangaDetails();
  }, [id]);

  const fetchMangaDetails = async () => {
    try {
      // Fetch manga details
      const { data: mangaData, error: mangaError } = await supabase
        .from('manga')
        .select('*')
        .eq('id', id)
        .single();

      if (mangaError) throw mangaError;
      setManga(mangaData);

      // Fetch chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('manga_chapters')
        .select('*')
        .eq('manga_id', id)
        .order('chapter_number', { ascending: false });

      if (chaptersError) throw chaptersError;
      setChapters(chaptersData || []);

      // Fetch genres
      const { data: genresData, error: genresError } = await supabase
        .from('manga_genres')
        .select(`
          genre_id,
          genres (
            id,
            name,
            name_arabic
          )
        `)
        .eq('manga_id', id);

      if (genresError) throw genresError;
      setGenres(genresData?.map((g: any) => g.genres) || []);
    } catch (error) {
      console.error('Error fetching manga details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">لم يتم العثور على المانجا</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div 
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${manga.banner_image || manga.cover_image || '/placeholder.svg'})`
        }}
      >
        <div className="container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex gap-6 items-end">
            <img
              src={manga.cover_image || "/placeholder.svg"}
              alt={manga.title_arabic || manga.title}
              className="w-48 h-64 object-cover rounded-lg shadow-xl"
            />
            <div className="text-white pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="mb-4 text-white hover:bg-white/20"
              >
                <Home className="ml-2 h-4 w-4" />
                الرئيسية
              </Button>
              <h1 className="text-4xl font-bold mb-2">
                {manga.title_arabic || manga.title}
              </h1>
              {manga.title_arabic && (
                <p className="text-xl text-white/80 mb-4">{manga.title}</p>
              )}
              <div className="flex gap-4 flex-wrap">
                <Badge variant="secondary" className="gap-1">
                  <BookOpen className="h-3 w-3" />
                  {manga.type}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  {manga.status || 'مستمر'}
                </Badge>
                {manga.rating && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    {manga.rating.toFixed(1)}
                  </Badge>
                )}
                {manga.release_year && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {manga.release_year}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {manga.description && (
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">القصة</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {manga.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Chapters */}
            <Card className="glass-effect">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">الفصول</h2>
                {chapters.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    لا توجد فصول متاحة حالياً
                  </p>
                ) : (
                  <div className="space-y-2">
                    {chapters.map((chapter) => (
                      <Link
                        key={chapter.id}
                        to={`/manga/${id}/chapter/${chapter.id}`}
                      >
                        <Card className="hover-lift cursor-pointer">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <h3 className="font-bold">
                                الفصل {chapter.chapter_number}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {chapter.title_arabic || chapter.title}
                              </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-primary" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info */}
            <Card className="glass-effect">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">معلومات</h2>
                
                {manga.author && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">المؤلف</p>
                      <p className="font-medium">{manga.author}</p>
                    </div>
                  </div>
                )}

                {manga.artist && (
                  <div className="flex items-start gap-3">
                    <Palette className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">الرسام</p>
                      <p className="font-medium">{manga.artist}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Genres */}
            {genres.length > 0 && (
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">التصنيفات</h2>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Link
                        key={genre.id}
                        to={`/manga?genre=${genre.id}`}
                      >
                        <Badge 
                          variant="outline" 
                          className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                        >
                          {genre.name_arabic || genre.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
