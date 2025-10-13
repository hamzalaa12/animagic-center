import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Home, BookOpen } from "lucide-react";

interface Page {
  id: string;
  page_number: number;
  image_url: string;
}

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  title_arabic: string | null;
}

interface Manga {
  id: string;
  title: string;
  title_arabic: string | null;
}

export default function ReadChapter() {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapterData();
  }, [chapterId]);

  const fetchChapterData = async () => {
    try {
      // Fetch manga info
      const { data: mangaData } = await supabase
        .from('manga')
        .select('id, title, title_arabic')
        .eq('id', mangaId)
        .single();
      
      setManga(mangaData);

      // Fetch current chapter
      const { data: chapterData } = await supabase
        .from('manga_chapters')
        .select('*')
        .eq('id', chapterId)
        .single();
      
      setCurrentChapter(chapterData);

      // Fetch all chapters
      const { data: chaptersData } = await supabase
        .from('manga_chapters')
        .select('id, chapter_number, title, title_arabic')
        .eq('manga_id', mangaId)
        .order('chapter_number', { ascending: true });
      
      setChapters(chaptersData || []);

      // Fetch pages
      const { data: pagesData } = await supabase
        .from('manga_pages')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('page_number', { ascending: true });
      
      setPages(pagesData || []);
    } catch (error) {
      console.error('Error fetching chapter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentChapterIndex = () => {
    return chapters.findIndex(c => c.id === chapterId);
  };

  const getNextChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    return currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
  };

  const getPreviousChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    return currentIndex > 0 ? chapters[currentIndex - 1] : null;
  };

  const handleChapterChange = (newChapterId: string) => {
    navigate(`/manga/${mangaId}/chapter/${newChapterId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <Home className="ml-2 h-4 w-4" />
                الرئيسية
              </Button>
              <Link to={`/manga/${mangaId}`}>
                <Button variant="ghost" size="sm">
                  <BookOpen className="ml-2 h-4 w-4" />
                  {manga?.title_arabic || manga?.title}
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Chapter Selector */}
              <Select value={chapterId} onValueChange={handleChapterChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue>
                    الفصل {currentChapter?.chapter_number}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      الفصل {chapter.chapter_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Navigation Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prev = getPreviousChapter();
                  if (prev) handleChapterChange(prev.id);
                }}
                disabled={!getPreviousChapter()}
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = getNextChapter();
                  if (next) handleChapterChange(next.id);
                }}
                disabled={!getNextChapter()}
              >
                التالي
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pages */}
      <div className="container mx-auto px-4 py-8">
        {pages.length === 0 ? (
          <Card className="glass-effect">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">
                لا توجد صفحات متاحة لهذا الفصل
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {pages.map((page) => (
              <div key={page.id} className="relative">
                <img
                  src={page.image_url}
                  alt={`صفحة ${page.page_number}`}
                  className="w-full h-auto rounded-lg shadow-lg"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {page.page_number}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const prev = getPreviousChapter();
                if (prev) handleChapterChange(prev.id);
              }}
              disabled={!getPreviousChapter()}
            >
              <ChevronRight className="ml-2 h-4 w-4" />
              الفصل السابق
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const next = getNextChapter();
                if (next) handleChapterChange(next.id);
              }}
              disabled={!getNextChapter()}
            >
              الفصل التالي
              <ChevronLeft className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
