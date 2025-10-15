import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Video, Plus } from "lucide-react";

interface Anime {
  id: string;
  title: string;
  title_arabic: string | null;
}

interface Season {
  id: string;
  season_number: number;
  title: string;
  title_arabic: string | null;
}

export const ManualEpisodeForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedAnime, setSelectedAnime] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [episodeData, setEpisodeData] = useState({
    episode_number: 1,
    title: "",
    title_arabic: "",
    thumbnail: "",
    duration: 24,
    servers: "" // Format: ServerName|URL, ServerName2|URL2
  });

  useEffect(() => {
    fetchAnimes();
  }, []);

  useEffect(() => {
    if (selectedAnime) {
      fetchSeasons(selectedAnime);
    }
  }, [selectedAnime]);

  const fetchAnimes = async () => {
    const { data, error } = await supabase
      .from('anime')
      .select('id, title, title_arabic')
      .order('title');

    if (!error && data) {
      setAnimes(data);
    }
  };

  const fetchSeasons = async (animeId: string) => {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('anime_id', animeId)
      .order('season_number');

    if (!error && data) {
      setSeasons(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeason) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الموسم",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Insert episode
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .insert([{
        season_id: selectedSeason,
        episode_number: episodeData.episode_number,
        title: episodeData.title,
        title_arabic: episodeData.title_arabic || null,
        thumbnail: episodeData.thumbnail || null,
        duration: episodeData.duration
      }])
      .select()
      .single();

    if (episodeError) {
      toast({
        title: "خطأ",
        description: episodeError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Insert servers if provided
    if (episodeData.servers && episode) {
      const serverLines = episodeData.servers.split('\n').filter(line => line.trim());
      const serversData = serverLines.map((line, index) => {
        const [name, url] = line.split('|').map(s => s.trim());
        return {
          episode_id: episode.id,
          server_name: name || `السيرفر ${index + 1}`,
          video_url: url,
          quality: '1080p'
        };
      }).filter(server => server.video_url);

      if (serversData.length > 0) {
        const { error: serversError } = await supabase
          .from('video_servers')
          .insert(serversData);

        if (serversError) {
          toast({
            title: "تحذير",
            description: "تم إضافة الحلقة لكن حدث خطأ في إضافة السيرفرات: " + serversError.message,
            variant: "destructive",
          });
        }
      }
    }

    toast({
      title: "نجح!",
      description: "تم إضافة الحلقة بنجاح",
    });

    setEpisodeData({
      episode_number: episodeData.episode_number + 1,
      title: "",
      title_arabic: "",
      thumbnail: "",
      duration: 24,
      servers: ""
    });

    setLoading(false);
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          إضافة حلقة جديدة
        </CardTitle>
        <CardDescription>أضف حلقة أنمي يدوياً</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="anime-select">اختر الأنمي</Label>
              <Select value={selectedAnime} onValueChange={setSelectedAnime}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الأنمي" />
                </SelectTrigger>
                <SelectContent>
                  {animes.map((anime) => (
                    <SelectItem key={anime.id} value={anime.id}>
                      {anime.title_arabic || anime.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season-select">اختر الموسم</Label>
              <Select value={selectedSeason} onValueChange={setSelectedSeason} disabled={!selectedAnime}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموسم" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.title_arabic || season.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="episode-number">رقم الحلقة</Label>
              <Input
                id="episode-number"
                type="number"
                value={episodeData.episode_number}
                onChange={(e) => setEpisodeData({...episodeData, episode_number: parseInt(e.target.value)})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="episode-duration">المدة (دقيقة)</Label>
              <Input
                id="episode-duration"
                type="number"
                value={episodeData.duration}
                onChange={(e) => setEpisodeData({...episodeData, duration: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="episode-title">العنوان (English)</Label>
              <Input
                id="episode-title"
                value={episodeData.title}
                onChange={(e) => setEpisodeData({...episodeData, title: e.target.value})}
                placeholder="Episode Title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="episode-title-arabic">العنوان (عربي)</Label>
              <Input
                id="episode-title-arabic"
                value={episodeData.title_arabic}
                onChange={(e) => setEpisodeData({...episodeData, title_arabic: e.target.value})}
                placeholder="عنوان الحلقة"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-thumbnail">رابط صورة الحلقة</Label>
            <Input
              id="episode-thumbnail"
              value={episodeData.thumbnail}
              onChange={(e) => setEpisodeData({...episodeData, thumbnail: e.target.value})}
              placeholder="https://example.com/episode-thumb.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-servers">السيرفرات (اسم السيرفر|رابط الفيديو)</Label>
            <Textarea
              id="episode-servers"
              value={episodeData.servers}
              onChange={(e) => setEpisodeData({...episodeData, servers: e.target.value})}
              placeholder="VidStream|https://example.com/video1&#10;Fembed|https://example.com/video2"
              rows={5}
            />
            <p className="text-sm text-muted-foreground">
              كل سيرفر في سطر. الصيغة: اسم السيرفر|رابط الفيديو
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "جاري الإضافة..." : "إضافة الحلقة"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
