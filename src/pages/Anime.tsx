import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AnimeCard } from "@/components/AnimeCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const Anime = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAnime();
  }, []);

  useEffect(() => {
    filterAnime();
  }, [searchQuery, typeFilter, statusFilter, animeList]);

  const fetchAnime = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnimeList(data);
    }
    setLoading(false);
  };

  const filterAnime = () => {
    let filtered = [...animeList];

    if (searchQuery) {
      filtered = filtered.filter(anime => 
        anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anime.title_arabic?.includes(searchQuery)
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(anime => anime.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(anime => anime.status === statusFilter);
    }

    setFilteredAnime(filtered);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">الأنمي</h1>
          <p className="text-muted-foreground">تصفح جميع الأنمي المتاح</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="ابحث عن أنمي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="tv">مسلسل (TV)</SelectItem>
              <SelectItem value="movie">فيلم</SelectItem>
              <SelectItem value="ova">OVA</SelectItem>
              <SelectItem value="special">خاص</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="ongoing">مستمر</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="upcoming">قريباً</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : filteredAnime.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {filteredAnime.map((anime) => (
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
        )}
      </div>
    </div>
  );
};

export default Anime;
