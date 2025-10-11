import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

export const Navbar = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminRole(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdminRole(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          <Link to="/" className="text-2xl font-bold gradient-text flex items-center gap-2">
            <span className="text-3xl">🎌</span>
            AnimeStream
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <Link to="/anime" className="text-foreground hover:text-primary transition-colors">
              الأنمي
            </Link>
            <Link to="/schedule" className="text-foreground hover:text-primary transition-colors">
              مواعيد الأنمي
            </Link>
            <Link to="/movies" className="text-foreground hover:text-primary transition-colors">
              أفلام الأنمي
            </Link>
            <Link to="/manga" className="text-foreground hover:text-primary transition-colors">
              المانجا
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="ابحث عن الأنمي..."
                className="pl-10 bg-muted/50 border-border focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    الملف الشخصي
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" className="gap-2">
                      <User className="h-4 w-4" />
                      لوحة التحكم
                    </Button>
                  </Link>
                )}
                <Button onClick={handleLogout} variant="ghost" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="gap-2 bg-gradient-to-r from-primary to-secondary">
                  <User className="h-4 w-4" />
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
