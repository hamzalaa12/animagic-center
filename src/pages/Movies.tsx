import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Anime {
  id: string;
  title: string;
  title_arabic: string | null;
  cover_image: string | null;
  rating: number | null;
  type: string | null;
  status: string | null;
}

const Movies = () => {
  const [movies, setMovies] = useState<Anime[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    filterMovies();
  }, [searchQuery, movies]);

  const fetchMovies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .eq('type', 'movie')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMovies(data);
    }
    setLoading(false);
  };

  const filterMovies = () => {
    if (!searchQuery) {
      setFilteredMovies(movies);
      return;
    }

    const filtered = movies.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.title_arabic?.includes(searchQuery)
    );

    setFilteredMovies(filtered);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">أفلام الأنمي</h1>
          <p className="text-muted-foreground">تصفح جميع أفلام الأنمي المتاحة</p>
        </div>

        <div className="mb-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="ابحث عن فيلم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              {searchQuery ? "لا توجد نتائج" : "لا توجد أفلام متاحة حالياً"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {filteredMovies.map((movie) => (
              <AnimeCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                titleArabic={movie.title_arabic || undefined}
                coverImage={movie.cover_image || undefined}
                rating={movie.rating || undefined}
                type={movie.type || undefined}
                status={movie.status || undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
