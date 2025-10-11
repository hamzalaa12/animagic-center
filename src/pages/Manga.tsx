import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Search } from "lucide-react";

const Manga = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">المانجا</h1>
          <p className="text-muted-foreground">اقرأ المانجا المترجمة المفضلة لديك</p>
        </div>

        <div className="mb-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="ابحث عن مانجا..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                مانجا شهيرة
              </CardTitle>
              <CardDescription>أشهر المانجا المترجمة</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                قريباً...
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                مانجا جديدة
              </CardTitle>
              <CardDescription>آخر المانجا المضافة</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                قريباً...
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                مانجا مستمرة
              </CardTitle>
              <CardDescription>المانجا المستمرة حالياً</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                قريباً...
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-effect mt-8">
          <CardHeader>
            <CardTitle>قريباً!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              نعمل حالياً على إضافة قسم المانجا مع مكتبة واسعة من المانجا المترجمة.
              ستتمكن من قراءة فصول المانجا مباشرة من الموقع مع ترجمات عالية الجودة!
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                تصفح حسب النوع
              </Button>
              <Button variant="outline" disabled>
                الأكثر قراءة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Manga;
