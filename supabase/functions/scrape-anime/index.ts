import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    console.log('Fetching anime data from:', url);

    // Fetch data from the anime source
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received data:', JSON.stringify(data).substring(0, 200));

    // Parse and insert anime data
    const animeData = {
      title: data.title || data.name,
      title_arabic: data.title_arabic || data.arabic_title,
      description: data.description || data.synopsis,
      cover_image: data.cover_image || data.image || data.poster,
      banner_image: data.banner_image || data.banner,
      type: data.type || 'tv',
      status: data.status || 'ongoing',
      release_year: data.release_year || data.year || new Date().getFullYear(),
      rating: data.rating || 0
    };

    // Insert anime
    const { data: insertedAnime, error: animeError } = await supabaseClient
      .from('anime')
      .insert([animeData])
      .select()
      .single();

    if (animeError) {
      console.error('Error inserting anime:', animeError);
      throw animeError;
    }

    console.log('Anime inserted:', insertedAnime.id);

    // Insert seasons if available
    if (data.seasons && Array.isArray(data.seasons)) {
      for (const season of data.seasons) {
        const { data: insertedSeason, error: seasonError } = await supabaseClient
          .from('seasons')
          .insert([{
            anime_id: insertedAnime.id,
            season_number: season.season_number || season.number,
            title: season.title || `Season ${season.season_number || season.number}`,
            title_arabic: season.title_arabic || `الموسم ${season.season_number || season.number}`
          }])
          .select()
          .single();

        if (seasonError) {
          console.error('Error inserting season:', seasonError);
          continue;
        }

        // Insert episodes if available
        if (season.episodes && Array.isArray(season.episodes)) {
          for (const episode of season.episodes) {
            const { data: insertedEpisode, error: episodeError } = await supabaseClient
              .from('episodes')
              .insert([{
                season_id: insertedSeason.id,
                episode_number: episode.episode_number || episode.number,
                title: episode.title || `Episode ${episode.episode_number || episode.number}`,
                title_arabic: episode.title_arabic,
                thumbnail: episode.thumbnail || episode.image,
                duration: episode.duration
              }])
              .select()
              .single();

            if (episodeError) {
              console.error('Error inserting episode:', episodeError);
              continue;
            }

            // Insert video servers if available
            if (episode.servers && Array.isArray(episode.servers)) {
              for (const server of episode.servers) {
                const { error: serverError } = await supabaseClient
                  .from('video_servers')
                  .insert([{
                    episode_id: insertedEpisode.id,
                    server_name: server.server_name || server.name || 'default',
                    video_url: server.video_url || server.url,
                    quality: server.quality || '1080p'
                  }]);

                if (serverError) {
                  console.error('Error inserting video server:', serverError);
                }
              }
            }
          }
        }
      }
    }

    // Insert genres if available
    if (data.genres && Array.isArray(data.genres)) {
      for (const genreName of data.genres) {
        // Check if genre exists
        const { data: existingGenre } = await supabaseClient
          .from('genres')
          .select('id')
          .eq('name', genreName)
          .maybeSingle();

        let genreId = existingGenre?.id;

        // Create genre if it doesn't exist
        if (!genreId) {
          const { data: newGenre } = await supabaseClient
            .from('genres')
            .insert([{ name: genreName }])
            .select('id')
            .single();
          
          genreId = newGenre?.id;
        }

        // Link anime to genre
        if (genreId) {
          await supabaseClient
            .from('anime_genres')
            .insert([{
              anime_id: insertedAnime.id,
              genre_id: genreId
            }]);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        anime_id: insertedAnime.id,
        message: 'تم سحب المحتوى بنجاح'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in scrape-anime function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'حدث خطأ غير متوقع'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
