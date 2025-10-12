import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface Manga {
  id: string;
  title: string;
  title_arabic: string | null;
  description: string | null;
  cover_image: string | null;
  type: string;
  status: string | null;
  rating: number | null;
}

export default function Manga() {
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchManga();
  }, []);

  const fetchManga = async () => {
    try {
      const { data, error } = await supabase
        .from('manga')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setManga(data || []);
    } catch (error) {
      console.error('Error fetching manga:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredManga = manga.filter((m) =>
    m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.title_arabic?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">المانجا</h1>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="ابحث عن مانجا..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : filteredManga.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">
              {searchQuery ? "لم يتم العثور على نتائج" : "لا توجد مانجا متاحة حالياً"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredManga.map((m) => (
              <Link key={m.id} to={`/manga/${m.id}`}>
                <Card className="group overflow-hidden hover-lift glass-effect h-full">
                  <CardContent className="p-0">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <img
                        src={m.cover_image || "/placeholder.svg"}
                        alt={m.title_arabic || m.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold line-clamp-2 text-sm mb-1">
                        {m.title_arabic || m.title}
                      </h3>
                      {m.rating && (
                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                          <span>⭐</span>
                          <span>{m.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
