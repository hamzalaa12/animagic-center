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
  const [url, setUrl] = useState("https://get.animerco.org/");
  const [loading, setLoading] = useState(false);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-anime', {
        body: { url }
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
              placeholder="https://get.animerco.org/"
              required
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              أدخل رابط API الذي يرجع بيانات JSON للأنمي
            </p>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">البيانات المطلوبة في JSON:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• title - عنوان الأنمي</li>
              <li>• description - الوصف</li>
              <li>• cover_image - صورة الغلاف</li>
              <li>• seasons[] - المواسم مع الحلقات</li>
              <li>• episodes[] - الحلقات مع السيرفرات</li>
              <li>• servers[] - سيرفرات المشاهدة</li>
            </ul>
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
              يمكنك إضافة مواقع أخرى بشرط توفير API يرجع البيانات بنفس الشكل
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
