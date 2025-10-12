import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { Plus, Film } from "lucide-react";
import { ContentManager } from "@/components/ContentManager";
import { AutoScraper } from "@/components/AutoScraper";
import { MangaScraper } from "@/components/MangaScraper";
import { SourcesManager } from "@/components/SourcesManager";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Anime form state
  const [animeData, setAnimeData] = useState({
    title: "",
    title_arabic: "",
    description: "",
    cover_image: "",
    banner_image: "",
    type: "tv",
    status: "ongoing",
    release_year: new Date().getFullYear(),
    rating: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setSession(session);

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (!data) {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحيات الوصول لهذه الصفحة",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const handleAddAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('anime')
      .insert([animeData]);

    if (error) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "نجح!",
        description: "تم إضافة الأنمي بنجاح",
      });
      
      setAnimeData({
        title: "",
        title_arabic: "",
        description: "",
        cover_image: "",
        banner_image: "",
        type: "tv",
        status: "ongoing",
        release_year: new Date().getFullYear(),
        rating: 0
      });
    }

    setLoading(false);
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">إدارة المحتوى والأنمي</p>
        </div>

        <Tabs defaultValue="add-anime" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="add-anime">إضافة أنمي</TabsTrigger>
            <TabsTrigger value="manage">إدارة المحتوى</TabsTrigger>
            <TabsTrigger value="scraper">سحب أنمي</TabsTrigger>
            <TabsTrigger value="manga-scraper">سحب مانجا</TabsTrigger>
            <TabsTrigger value="sources">المصادر</TabsTrigger>
          </TabsList>

          <TabsContent value="add-anime">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  إضافة أنمي جديد
                </CardTitle>
                <CardDescription>أضف معلومات الأنمي الجديد</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAnime} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">العنوان (English)</Label>
                      <Input
                        id="title"
                        value={animeData.title}
                        onChange={(e) => setAnimeData({...animeData, title: e.target.value})}
                        placeholder="Attack on Titan"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title_arabic">العنوان (عربي)</Label>
                      <Input
                        id="title_arabic"
                        value={animeData.title_arabic}
                        onChange={(e) => setAnimeData({...animeData, title_arabic: e.target.value})}
                        placeholder="هجوم العمالقة"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={animeData.description}
                      onChange={(e) => setAnimeData({...animeData, description: e.target.value})}
                      placeholder="وصف الأنمي..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cover_image">رابط صورة الغلاف</Label>
                      <Input
                        id="cover_image"
                        value={animeData.cover_image}
                        onChange={(e) => setAnimeData({...animeData, cover_image: e.target.value})}
                        placeholder="https://example.com/cover.jpg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="banner_image">رابط صورة البانر</Label>
                      <Input
                        id="banner_image"
                        value={animeData.banner_image}
                        onChange={(e) => setAnimeData({...animeData, banner_image: e.target.value})}
                        placeholder="https://example.com/banner.jpg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type">النوع</Label>
                      <Select
                        value={animeData.type}
                        onValueChange={(value) => setAnimeData({...animeData, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tv">مسلسل (TV)</SelectItem>
                          <SelectItem value="movie">فيلم</SelectItem>
                          <SelectItem value="ova">OVA</SelectItem>
                          <SelectItem value="special">خاص</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">الحالة</Label>
                      <Select
                        value={animeData.status}
                        onValueChange={(value) => setAnimeData({...animeData, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ongoing">مستمر</SelectItem>
                          <SelectItem value="completed">مكتمل</SelectItem>
                          <SelectItem value="upcoming">قريباً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="release_year">سنة الإصدار</Label>
                      <Input
                        id="release_year"
                        type="number"
                        value={animeData.release_year}
                        onChange={(e) => setAnimeData({...animeData, release_year: parseInt(e.target.value)})}
                        min="1900"
                        max="2100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">التقييم (0-10)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      value={animeData.rating}
                      onChange={(e) => setAnimeData({...animeData, rating: parseFloat(e.target.value)})}
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
                    {loading ? "جاري الإضافة..." : "إضافة الأنمي"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <ContentManager />
          </TabsContent>

          <TabsContent value="scraper">
            <AutoScraper />
          </TabsContent>

          <TabsContent value="manga-scraper">
            <MangaScraper />
          </TabsContent>

          <TabsContent value="sources">
            <SourcesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
