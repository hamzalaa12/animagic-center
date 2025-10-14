import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BookOpen } from "lucide-react";

export const MangaScraper = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-anime', {
        body: { url, type: 'manga' }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "نجح!",
          description: data.message || "تم سحب المانجا بنجاح",
        });
      } else {
        throw new Error(data.error || "فشل سحب المانجا");
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في سحب المانجا",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          سحب المانجا تلقائياً
        </CardTitle>
        <CardDescription>
          سحب المانجا من المواقع المدعومة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleScrape} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="manga-url">
              رابط صفحة المانجا
            </Label>
            <Input
              id="manga-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://azoramoon.com/manga/one-piece"
              required
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              أدخل رابط صفحة المانجا المراد سحبها (HTML)
            </p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-purple-500">💡 كيف يعمل</h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>أدخل رابط صفحة المانجا الكاملة (وليس رابط فصل)</li>
              <li>سيتم تحليل HTML واستخراج جميع البيانات تلقائياً</li>
              <li>يستخرج: العنوان، الوصف، الصور، الفصول، الصفحات، المؤلف، والتصنيفات</li>
              <li>سيحاول جلب صور الفصول من صفحاتها تلقائياً</li>
              <li>يجمع جميع صور الفصل الواحد معاً (لا تكرار)</li>
            </ul>
            
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">✨ التحسينات الجديدة</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside mr-2">
                <li>إزالة الفصول المكررة - كل فصل مرة واحدة فقط</li>
                <li>فك تشفير Unicode للنصوص العربية تلقائياً</li>
                <li>دعم كامل للصور الكسولة (data-src, data-lazy)</li>
                <li>تصفية ذكية للمحتوى وإزالة السكريبتات</li>
                <li>تأخير عشوائي بين الطلبات لتجنب الحظر</li>
              </ul>
            </div>
            
            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">⚠️ ملاحظة هامة</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside mr-2">
                <li>المواقع المحمية بـ Cloudflare قد ترفض السحب</li>
                <li>استخراج صفحات الفصول قد يستغرق وقتاً (بسبب التأخير)</li>
                <li>إذا فشل السحب، جرب موقع آخر</li>
              </ul>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary"
            disabled={loading}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {loading ? "جاري السحب..." : "سحب المانجا"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-semibold mb-3">المواقع المدعومة:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded">
              <span className="text-sm">azoramoon.com</span>
              <span className="text-xs text-muted-foreground">(افتراضي)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              يمكنك إضافة مواقع أخرى من خلال إدارة المصادر
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
