import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const Schedule = () => {
  const daysOfWeek = [
    "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">مواعيد الأنمي</h1>
          <p className="text-muted-foreground">جدول عرض الحلقات الأسبوعي</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {daysOfWeek.map((day) => (
            <Card key={day} className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  لا توجد حلقات مجدولة
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-effect mt-8">
          <CardHeader>
            <CardTitle>قريباً!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              سيتم إضافة جدول المواعيد الأسبوعي للحلقات الجديدة قريباً.
              ستتمكن من معرفة مواعيد عرض حلقاتك المفضلة بسهولة!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Schedule;
