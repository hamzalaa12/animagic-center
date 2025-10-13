import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Search, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ContentItem {
  id: string;
  title: string;
  title_arabic?: string;
  type?: string;
  status?: string;
  release_year?: number;
  rating?: number;
  created_at: string;
}

export const ContentManager = ({ contentType }: { contentType: 'anime' | 'manga' }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchItems();
  }, [contentType]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from(contentType)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل المحتوى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;

    try {
      const { error } = await supabase
        .from(contentType)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "نجح!",
        description: "تم الحذف بنجاح",
      });

      fetchItems();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في حذف العنصر",
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title_arabic?.includes(searchQuery)
  );

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          إدارة {contentType === 'anime' ? 'الأنمي' : 'المانجا'}
        </CardTitle>
        <CardDescription>
          عرض وإدارة جميع {contentType === 'anime' ? 'الأنمي' : 'المانجا'} المتاحة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث..."
              className="pr-10"
            />
          </div>
          <Button onClick={fetchItems} variant="outline">تحديث</Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>السنة</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد عناصر
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        {item.title_arabic && (
                          <div className="text-xs text-muted-foreground">{item.title_arabic}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.type || 'غير محدد'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'ongoing' ? 'default' : 'outline'}>
                        {item.status === 'ongoing' ? 'مستمر' : item.status === 'completed' ? 'مكتمل' : 'قادم'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.release_year || '-'}</TableCell>
                    <TableCell>{item.rating ? item.rating.toFixed(1) : '0.0'}</TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => window.open(`/${contentType}/${item.id}`, '_blank')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">إجمالي: {filteredItems.length} عنصر</div>
      </CardContent>
    </Card>
  );
};
