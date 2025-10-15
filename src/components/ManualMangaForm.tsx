import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus } from "lucide-react";

export const ManualMangaForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mangaData, setMangaData] = useState({
    title: "",
    title_arabic: "",
    description: "",
    cover_image: "",
    banner_image: "",
    type: "manga",
    status: "ongoing",
    release_year: new Date().getFullYear(),
    rating: 0,
    author: "",
    artist: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('manga')
      .insert([mangaData]);

    if (error) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "نجح!",
        description: "تم إضافة المانجا بنجاح",
      });
      
      setMangaData({
        title: "",
        title_arabic: "",
        description: "",
        cover_image: "",
        banner_image: "",
        type: "manga",
        status: "ongoing",
        release_year: new Date().getFullYear(),
        rating: 0,
        author: "",
        artist: ""
      });
    }

    setLoading(false);
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          إضافة مانجا جديدة
        </CardTitle>
        <CardDescription>أضف معلومات المانجا يدوياً</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="manga-title">العنوان (English)</Label>
              <Input
                id="manga-title"
                value={mangaData.title}
                onChange={(e) => setMangaData({...mangaData, title: e.target.value})}
                placeholder="One Piece"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manga-title-arabic">العنوان (عربي)</Label>
              <Input
                id="manga-title-arabic"
                value={mangaData.title_arabic}
                onChange={(e) => setMangaData({...mangaData, title_arabic: e.target.value})}
                placeholder="ون بيس"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manga-description">الوصف</Label>
            <Textarea
              id="manga-description"
              value={mangaData.description}
              onChange={(e) => setMangaData({...mangaData, description: e.target.value})}
              placeholder="وصف المانجا..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="manga-author">المؤلف</Label>
              <Input
                id="manga-author"
                value={mangaData.author}
                onChange={(e) => setMangaData({...mangaData, author: e.target.value})}
                placeholder="اسم المؤلف"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manga-artist">الرسام</Label>
              <Input
                id="manga-artist"
                value={mangaData.artist}
                onChange={(e) => setMangaData({...mangaData, artist: e.target.value})}
                placeholder="اسم الرسام"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="manga-cover">رابط صورة الغلاف</Label>
              <Input
                id="manga-cover"
                value={mangaData.cover_image}
                onChange={(e) => setMangaData({...mangaData, cover_image: e.target.value})}
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manga-banner">رابط صورة البانر</Label>
              <Input
                id="manga-banner"
                value={mangaData.banner_image}
                onChange={(e) => setMangaData({...mangaData, banner_image: e.target.value})}
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="manga-type">النوع</Label>
              <Select
                value={mangaData.type}
                onValueChange={(value) => setMangaData({...mangaData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manga">مانجا</SelectItem>
                  <SelectItem value="manhwa">مانهوا</SelectItem>
                  <SelectItem value="manhua">مانخوا</SelectItem>
                  <SelectItem value="webtoon">ويبتون</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manga-status">الحالة</Label>
              <Select
                value={mangaData.status}
                onValueChange={(value) => setMangaData({...mangaData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">مستمر</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="hiatus">متوقف مؤقتاً</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manga-year">سنة الإصدار</Label>
              <Input
                id="manga-year"
                type="number"
                value={mangaData.release_year}
                onChange={(e) => setMangaData({...mangaData, release_year: parseInt(e.target.value)})}
                min="1900"
                max="2100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manga-rating">التقييم (0-10)</Label>
            <Input
              id="manga-rating"
              type="number"
              step="0.1"
              value={mangaData.rating}
              onChange={(e) => setMangaData({...mangaData, rating: parseFloat(e.target.value)})}
              min="0"
              max="10"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "جاري الإضافة..." : "إضافة المانجا"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
