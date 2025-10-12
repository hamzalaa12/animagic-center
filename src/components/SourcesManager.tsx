import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Globe, Trash2, Plus } from "lucide-react";

interface Source {
  id: string;
  name: string;
  url: string;
  type: 'anime' | 'manga';
  is_active: boolean;
}

export const SourcesManager = () => {
  const { toast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSource, setNewSource] = useState({
    name: "",
    url: "",
    type: "anime" as 'anime' | 'manga'
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const { data, error } = await supabase
        .from('scraper_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSources((data || []) as Source[]);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل المصادر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('scraper_sources')
        .insert([newSource]);

      if (error) throw error;

      toast({
        title: "نجح!",
        description: "تمت إضافة المصدر بنجاح",
      });

      setNewSource({ name: "", url: "", type: "anime" });
      fetchSources();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة المصدر",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scraper_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "نجح!",
        description: "تم حذف المصدر بنجاح",
      });

      fetchSources();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في حذف المصدر",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          إدارة مصادر السحب
        </CardTitle>
        <CardDescription>
          إضافة وإدارة المواقع التي يتم السحب منها
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAddSource} className="space-y-4 p-4 bg-muted/20 rounded-lg">
          <h3 className="font-semibold">إضافة مصدر جديد</h3>
          
          <div className="space-y-2">
            <Label htmlFor="source-name">اسم المصدر</Label>
            <Input
              id="source-name"
              value={newSource.name}
              onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              placeholder="مثال: AnimeRCO"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source-url">رابط الموقع</Label>
            <Input
              id="source-url"
              value={newSource.url}
              onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
              placeholder="https://example.com"
              required
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source-type">النوع</Label>
            <Select
              value={newSource.type}
              onValueChange={(value: 'anime' | 'manga') => setNewSource({ ...newSource, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anime">أنمي</SelectItem>
                <SelectItem value="manga">مانجا</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            إضافة المصدر
          </Button>
        </form>

        <div className="space-y-3">
          <h3 className="font-semibold">المصادر الحالية</h3>
          {sources.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              لا توجد مصادر مضافة
            </p>
          ) : (
            sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-semibold">{source.name}</h4>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {source.url}
                  </p>
                  <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                    {source.type === 'anime' ? 'أنمي' : 'مانجا'}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteSource(source.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
