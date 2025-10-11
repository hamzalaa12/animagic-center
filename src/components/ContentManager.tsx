import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Film } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Anime {
  id: string;
  title: string;
  title_arabic: string | null;
  cover_image: string | null;
  type: string | null;
  status: string | null;
  rating: number | null;
}

export const ContentManager = () => {
  const { toast } = useToast();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnimeList();
  }, []);

  const fetchAnimeList = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('anime')
      .select('id, title, title_arabic, cover_image, type, status, rating')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAnimeList(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedAnimeId) return;

    const { error } = await supabase
      .from('anime')
      .delete()
      .eq('id', selectedAnimeId);

    if (error) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "نجح!",
        description: "تم حذف الأنمي بنجاح",
      });
      fetchAnimeList();
    }

    setDeleteDialogOpen(false);
    setSelectedAnimeId(null);
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="py-12">
          <p className="text-muted-foreground text-center">جاري التحميل...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            إدارة المحتوى
          </CardTitle>
          <CardDescription>تعديل وحذف الأنمي الموجود</CardDescription>
        </CardHeader>
        <CardContent>
          {animeList.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              لا يوجد محتوى بعد
            </p>
          ) : (
            <div className="space-y-4">
              {animeList.map((anime) => (
                <div
                  key={anime.id}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {anime.cover_image && (
                    <img
                      src={anime.cover_image}
                      alt={anime.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{anime.title_arabic || anime.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {anime.type} • {anime.status} • ⭐ {anime.rating || 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        toast({
                          title: "قريباً",
                          description: "ميزة التعديل قريباً",
                        });
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setSelectedAnimeId(anime.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الأنمي نهائياً من قاعدة البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
