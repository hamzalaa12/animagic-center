import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AnimeCard } from "@/components/AnimeCard";
import { Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Anime {
  id: string;
  title: string;
  title_arabic: string | null;
  description: string | null;
  cover_image: string | null;
  type: string;
  status: string;
  rating: number | null;
}

const DAYS = [
  { value: 'sunday', label: 'الأحد' },
  { value: 'monday', label: 'الاثنين' },
  { value: 'tuesday', label: 'الثلاثاء' },
  { value: 'wednesday', label: 'الأربعاء' },
  { value: 'thursday', label: 'الخميس' },
  { value: 'friday', label: 'الجمعة' },
  { value: 'saturday', label: 'السبت' },
];

export default function Schedule() {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOngoingAnime();
  }, []);

  const fetchOngoingAnime = async () => {
    try {
      const { data, error } = await supabase
        .from('anime')
        .select('*')
        .eq('status', 'ongoing')
        .order('title_arabic', { ascending: true });

      if (error) throw error;
      setAnime(data || []);
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnimeForDay = (dayIndex: number) => {
    return anime.filter((_, index) => index % 7 === dayIndex);
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">مواعيد الأنمي</h1>
          </div>
          <p className="text-muted-foreground">
            تابع مواعيد بث الحلقات الجديدة
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : (
          <Tabs defaultValue="sunday" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              {DAYS.map((day) => (
                <TabsTrigger key={day.value} value={day.value}>
                  {day.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {DAYS.map((day, index) => {
              const dayAnime = getAnimeForDay(index);
              return (
                <TabsContent key={day.value} value={day.value}>
                  {dayAnime.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        لا توجد حلقات في هذا اليوم
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                      {dayAnime.map((a) => (
                        <AnimeCard
                          key={a.id}
                          id={a.id}
                          title={a.title}
                          titleArabic={a.title_arabic}
                          coverImage={a.cover_image}
                          type={a.type}
                          rating={a.rating}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
}
