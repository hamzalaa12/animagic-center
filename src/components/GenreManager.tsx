import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tags, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Genre {
  id: string;
  name: string;
  name_arabic: string | null;
}

export const GenreManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newGenre, setNewGenre] = useState({
    name: "",
    name_arabic: ""
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    const { data, error } = await supabase
      .from('genres')
      .select('*')
      .order('name');

    if (!error && data) {
      setGenres(data);
    }
  };

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenre.name) return;

    setLoading(true);

    const { error } = await supabase
      .from('genres')
      .insert([{
        name: newGenre.name,
        name_arabic: newGenre.name_arabic || null
      }]);

    if (error) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "نجح!",
        description: "تم إضافة التصنيف بنجاح",
      });
      setNewGenre({ name: "", name_arabic: "" });
      fetchGenres();
    }

    setLoading(false);
  };

  const handleDeleteGenre = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

    const { error } = await supabase
      .from('genres')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "نجح!",
        description: "تم حذف التصنيف بنجاح",
      });
      fetchGenres();
    }
  };

  // Predefined popular genres
  const popularGenres = [
    { name: "Action", name_arabic: "أكشن" },
    { name: "Adventure", name_arabic: "مغامرة" },
    { name: "Comedy", name_arabic: "كوميديا" },
    { name: "Drama", name_arabic: "دراما" },
    { name: "Fantasy", name_arabic: "فانتازيا" },
    { name: "Horror", name_arabic: "رعب" },
    { name: "Mystery", name_arabic: "غموض" },
    { name: "Romance", name_arabic: "رومانسي" },
    { name: "Sci-Fi", name_arabic: "خيال علمي" },
    { name: "Slice of Life", name_arabic: "شريحة من الحياة" },
    { name: "Sports", name_arabic: "رياضة" },
    { name: "Supernatural", name_arabic: "خارق للطبيعة" },
    { name: "Thriller", name_arabic: "إثارة" },
    { name: "Psychological", name_arabic: "نفسي" },
    { name: "Historical", name_arabic: "تاريخي" },
    { name: "Mecha", name_arabic: "ميكا" },
    { name: "School", name_arabic: "مدرسي" },
    { name: "Martial Arts", name_arabic: "فنون قتالية" },
    { name: "Isekai", name_arabic: "عالم آخر" },
    { name: "Harem", name_arabic: "حريم" }
  ];

  const addPopularGenres = async () => {
    setLoading(true);
    
    for (const genre of popularGenres) {
      // Check if genre already exists
      const exists = genres.some(g => g.name.toLowerCase() === genre.name.toLowerCase());
      if (!exists) {
        await supabase.from('genres').insert([genre]);
      }
    }

    toast({
      title: "نجح!",
      description: "تم إضافة التصنيفات الشائعة",
    });

    fetchGenres();
    setLoading(false);
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          إدارة التصنيفات
        </CardTitle>
        <CardDescription>أضف وأدر تصنيفات الأنمي والمانجا</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAddGenre} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre-name">اسم التصنيف (English)</Label>
              <Input
                id="genre-name"
                value={newGenre.name}
                onChange={(e) => setNewGenre({...newGenre, name: e.target.value})}
                placeholder="Action"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre-name-arabic">اسم التصنيف (عربي)</Label>
              <Input
                id="genre-name-arabic"
                value={newGenre.name_arabic}
                onChange={(e) => setNewGenre({...newGenre, name_arabic: e.target.value})}
                placeholder="أكشن"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة تصنيف
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={addPopularGenres}
              disabled={loading}
            >
              إضافة التصنيفات الشائعة
            </Button>
          </div>
        </form>

        <div>
          <h3 className="text-lg font-semibold mb-3">التصنيفات الموجودة ({genres.length})</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Badge key={genre.id} variant="secondary" className="px-3 py-2 text-sm">
                {genre.name_arabic || genre.name}
                <button
                  onClick={() => handleDeleteGenre(genre.id)}
                  className="mr-2 hover:text-destructive"
                  type="button"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {genres.length === 0 && (
            <p className="text-muted-foreground text-sm">لا توجد تصنيفات بعد. أضف تصنيفات جديدة أو استخدم التصنيفات الشائعة.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
