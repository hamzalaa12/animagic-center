import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Episode {
  id: string;
  episode_number: number;
  title: string;
  title_arabic: string | null;
}

interface VideoServer {
  id: string;
  server_name: string;
  video_url: string;
  quality: string | null;
}

const Watch = () => {
  const { episodeId } = useParams();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [servers, setServers] = useState<VideoServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<VideoServer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (episodeId) {
      fetchEpisodeData();
    }
  }, [episodeId]);

  const fetchEpisodeData = async () => {
    if (!episodeId) return;

    const { data: episodeData } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single();

    if (episodeData) {
      setEpisode(episodeData);
    }

    const { data: serversData } = await supabase
      .from('video_servers')
      .select('*')
      .eq('episode_id', episodeId);

    if (serversData && serversData.length > 0) {
      setServers(serversData);
      setSelectedServer(serversData[0]);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="aspect-video bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold">لم يتم العثور على الحلقة</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Video Player */}
        <Card className="glass-effect p-4 mb-8">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
            {selectedServer ? (
              <iframe
                src={selectedServer.video_url}
                className="w-full h-full"
                allowFullScreen
                title="Video Player"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground">لا توجد سيرفرات متاحة</p>
              </div>
            )}
          </div>

          {/* Episode Info */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">
              الحلقة {episode.episode_number}
            </h1>
            <p className="text-muted-foreground">
              {episode.title_arabic || episode.title}
            </p>
          </div>

          {/* Servers */}
          {servers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">سيرفرات المشاهدة</h3>
              <div className="flex flex-wrap gap-2">
                {servers.map((server) => (
                  <Button
                    key={server.id}
                    onClick={() => setSelectedServer(server)}
                    variant={selectedServer?.id === server.id ? "default" : "outline"}
                    className={selectedServer?.id === server.id ? "bg-gradient-to-r from-primary to-secondary" : ""}
                  >
                    {server.server_name}
                    {server.quality && <span className="ml-2 text-xs">({server.quality})</span>}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Watch;
