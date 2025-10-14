import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Link as LinkIcon } from "lucide-react";

export const AutoScraper = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-anime', {
        body: { url, type: 'anime' }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "نجح!",
          description: data.message || "تم سحب المحتوى بنجاح",
        });
      } else {
        throw new Error(data.error || "فشل سحب المحتوى");
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في سحب المحتوى",
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
          <Download className="h-5 w-5" />
          السحب التلقائي للمحتوى
        </CardTitle>
        <CardDescription>
          سحب المحتوى تلقائياً من المواقع الأخرى
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleScrape} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="scrape-url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              رابط API المحتوى
            </Label>
            <Input
              id="scrape-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://animerco.org/anime/attack-on-titan"
              required
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              أدخل رابط صفحة الأنمي المراد سحبه (HTML)
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-blue-500">💡 كيف يعمل</h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>أدخل رابط صفحة الأنمي الكاملة (وليس رابط حلقة)</li>
              <li>سيتم تحليل HTML واستخراج جميع المعلومات تلقائياً</li>
              <li>يستخرج: العنوان، الوصف، الصور، المواسم، الحلقات، السيرفرات، والتصنيفات</li>
              <li>يدعم الصور المحملة بالـ lazy loading (data-src)</li>
              <li>يفك تشفير النصوص العربية تلقائياً</li>
            </ul>
            
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">✨ التحسينات الجديدة</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside mr-2">
                <li>تصفية ذكية للمحتوى - إزالة السكريبتات والأكواد غير المفيدة</li>
                <li>فك تشفير Unicode (\\u0625\\u0644\\u0649) تلقائياً</li>
                <li>دعم كامل للصور الكسولة (data-src, data-lazy, data-original)</li>
                <li>headers محسّنة لتجاوز بعض الحمايات الأساسية</li>
              </ul>
            </div>
            
            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">⚠️ ملاحظة هامة</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside mr-2">
                <li>المواقع المحمية بـ Cloudflare قد ترفض السحب</li>
                <li>إذا فشل السحب، جرب موقع آخر أو أضف المحتوى يدوياً</li>
                <li>النظام يضيف تأخير عشوائي بين الطلبات لتجنب الحظر</li>
              </ul>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary"
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? "جاري السحب..." : "سحب المحتوى"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-semibold mb-3">المواقع المدعومة:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded">
              <span className="text-sm">animerco.org</span>
              <span className="text-xs text-muted-foreground">(افتراضي)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              يمكنك إضافة مواقع أخرى من خلال تبويب "المصادر"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
