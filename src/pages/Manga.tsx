import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const Manga = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-4xl font-bold gradient-text">المانجا</h1>
          <p className="text-muted-foreground text-lg">
            قسم المانجا قريباً
          </p>
          
          <Card className="glass-effect mt-8 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>قريباً!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                نعمل حالياً على إضافة قسم المانجا مع مكتبة واسعة من المانجا المترجمة.
                ترقبوا التحديثات القادمة!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Manga;
