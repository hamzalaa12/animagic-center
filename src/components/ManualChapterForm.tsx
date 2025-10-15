import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus } from "lucide-react";

interface Manga {
  id: string;
  title: string;
  title_arabic: string | null;
}

export const ManualChapterForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [selectedManga, setSelectedManga] = useState("");
  const [chapterData, setChapterData] = useState({
    chapter_number: 1,
    title: "",
    title_arabic: "",
    thumbnail: "",
    pages: "" // Comma-separated image URLs
  });

  useEffect(() => {
    fetchMangas();
  }, []);

  const fetchMangas = async () => {
    const { data, error } = await supabase
      .from('manga')
      .select('id, title, title_arabic')
      .order('title');

    if (!error && data) {
      setMangas(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManga) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار المانجا",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Insert chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('manga_chapters')
      .insert([{
        manga_id: selectedManga,
        chapter_number: chapterData.chapter_number,
        title: chapterData.title,
        title_arabic: chapterData.title_arabic || null,
        thumbnail: chapterData.thumbnail || null,
        release_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (chapterError) {
      toast({
        title: "خطأ",
        description: chapterError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Insert pages if provided
    if (chapterData.pages && chapter) {
      const pageUrls = chapterData.pages.split(',').map(url => url.trim()).filter(url => url);
      const pagesData = pageUrls.map((url, index) => ({
        chapter_id: chapter.id,
        page_number: index + 1,
        image_url: url
      }));

      const { error: pagesError } = await supabase
        .from('manga_pages')
        .insert(pagesData);

      if (pagesError) {
        toast({
          title: "تحذير",
          description: "تم إضافة الفصل لكن حدث خطأ في إضافة الصفحات: " + pagesError.message,
          variant: "destructive",
        });
      }
    }

    toast({
      title: "نجح!",
      description: "تم إضافة الفصل بنجاح",
    });

    setChapterData({
      chapter_number: chapterData.chapter_number + 1,
      title: "",
      title_arabic: "",
      thumbnail: "",
      pages: ""
    });

    setLoading(false);
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          إضافة فصل جديد
        </CardTitle>
        <CardDescription>أضف فصل مانجا يدوياً</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="manga-select">اختر المانجا</Label>
            <Select value={selectedManga} onValueChange={setSelectedManga}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المانجا" />
              </SelectTrigger>
              <SelectContent>
                {mangas.map((manga) => (
                  <SelectItem key={manga.id} value={manga.id}>
                    {manga.title_arabic || manga.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="chapter-number">رقم الفصل</Label>
              <Input
                id="chapter-number"
                type="number"
                step="0.1"
                value={chapterData.chapter_number}
                onChange={(e) => setChapterData({...chapterData, chapter_number: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chapter-title">العنوان (English)</Label>
              <Input
                id="chapter-title"
                value={chapterData.title}
                onChange={(e) => setChapterData({...chapterData, title: e.target.value})}
                placeholder="Chapter Title"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter-title-arabic">العنوان (عربي)</Label>
            <Input
              id="chapter-title-arabic"
              value={chapterData.title_arabic}
              onChange={(e) => setChapterData({...chapterData, title_arabic: e.target.value})}
              placeholder="عنوان الفصل"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter-thumbnail">رابط صورة الفصل</Label>
            <Input
              id="chapter-thumbnail"
              value={chapterData.thumbnail}
              onChange={(e) => setChapterData({...chapterData, thumbnail: e.target.value})}
              placeholder="https://example.com/chapter-thumb.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter-pages">روابط الصفحات (افصل بفاصلة)</Label>
            <Textarea
              id="chapter-pages"
              value={chapterData.pages}
              onChange={(e) => setChapterData({...chapterData, pages: e.target.value})}
              placeholder="https://example.com/page1.jpg, https://example.com/page2.jpg, ..."
              rows={5}
            />
            <p className="text-sm text-muted-foreground">
              أدخل روابط صور الصفحات مفصولة بفاصلة. سيتم ترقيمها تلقائياً.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "جاري الإضافة..." : "إضافة الفصل"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
