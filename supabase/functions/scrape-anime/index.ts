import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

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

    const { url, type = 'anime' } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    console.log(`Fetching ${type} data from:`, url);

    // Fetch HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Received HTML, length:', html.length);

    // Parse HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    if (type === 'anime') {
      return await scrapeAnime(doc, url, supabaseClient);
    } else if (type === 'manga') {
      return await scrapeManga(doc, url, supabaseClient);
    } else {
      throw new Error('Invalid type. Must be "anime" or "manga"');
    }

  } catch (error: any) {
    console.error('Error in scrape function:', error);
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

async function scrapeAnime(doc: any, url: string, supabaseClient: any) {
  // Extract anime data from HTML
  const animeData = {
    title: doc.querySelector('h1, .title, .anime-title')?.textContent?.trim() || 'Untitled',
    title_arabic: doc.querySelector('.title-arabic, .arabic-title')?.textContent?.trim(),
    description: doc.querySelector('.description, .synopsis, p')?.textContent?.trim(),
    cover_image: doc.querySelector('img.cover, .poster img, img')?.getAttribute('src'),
    banner_image: doc.querySelector('.banner img, .header-image img')?.getAttribute('src'),
    type: 'tv',
    status: 'ongoing',
    release_year: new Date().getFullYear(),
    rating: 0
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

  // Try to extract seasons and episodes from HTML
  const seasonElements = doc.querySelectorAll('.season, .season-item');
  if (seasonElements && seasonElements.length > 0) {
    for (let i = 0; i < seasonElements.length; i++) {
      const seasonEl = seasonElements[i];
      const seasonData = {
        anime_id: insertedAnime.id,
        season_number: i + 1,
        title: seasonEl.querySelector('.season-title')?.textContent?.trim() || `Season ${i + 1}`,
        title_arabic: seasonEl.querySelector('.season-title-arabic')?.textContent?.trim() || `الموسم ${i + 1}`
      };

      const { data: insertedSeason, error: seasonError } = await supabaseClient
        .from('seasons')
        .insert([seasonData])
        .select()
        .single();

      if (seasonError) {
        console.error('Error inserting season:', seasonError);
        continue;
      }

      // Extract episodes for this season
      const episodeElements = seasonEl.querySelectorAll('.episode, .episode-item');
      for (let j = 0; j < episodeElements.length; j++) {
        const episodeEl = episodeElements[j];
        const episodeData = {
          season_id: insertedSeason.id,
          episode_number: j + 1,
          title: episodeEl.querySelector('.episode-title')?.textContent?.trim() || `Episode ${j + 1}`,
          title_arabic: episodeEl.querySelector('.episode-title-arabic')?.textContent?.trim(),
          thumbnail: episodeEl.querySelector('img')?.getAttribute('src')
        };

        const { data: insertedEpisode, error: episodeError } = await supabaseClient
          .from('episodes')
          .insert([episodeData])
          .select()
          .single();

        if (episodeError) {
          console.error('Error inserting episode:', episodeError);
          continue;
        }

        // Extract video servers
        const serverLinks = episodeEl.querySelectorAll('a[href*="watch"], .server-link');
        for (let k = 0; k < serverLinks.length; k++) {
          const serverLink = serverLinks[k];
          const serverData = {
            episode_id: insertedEpisode.id,
            server_name: serverLink.textContent?.trim() || `Server ${k + 1}`,
            video_url: serverLink.getAttribute('href') || '',
            quality: '1080p'
          };

          await supabaseClient.from('video_servers').insert([serverData]);
        }
      }
    }
  }

  // Extract genres
  const genreElements = doc.querySelectorAll('.genre, .tag, .category');
  for (let i = 0; i < genreElements.length; i++) {
    const genreName = genreElements[i].textContent?.trim();
    if (!genreName) continue;

    const { data: existingGenre } = await supabaseClient
      .from('genres')
      .select('id')
      .eq('name', genreName)
      .maybeSingle();

    let genreId = existingGenre?.id;

    if (!genreId) {
      const { data: newGenre } = await supabaseClient
        .from('genres')
        .insert([{ name: genreName }])
        .select('id')
        .single();
      
      genreId = newGenre?.id;
    }

    if (genreId) {
      await supabaseClient
        .from('anime_genres')
        .insert([{
          anime_id: insertedAnime.id,
          genre_id: genreId
        }]);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      anime_id: insertedAnime.id,
      message: 'تم سحب الأنمي بنجاح'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scrapeManga(doc: any, url: string, supabaseClient: any) {
  // Extract manga data from HTML
  const mangaData = {
    title: doc.querySelector('h1, .title, .manga-title')?.textContent?.trim() || 'Untitled',
    title_arabic: doc.querySelector('.title-arabic, .arabic-title')?.textContent?.trim(),
    description: doc.querySelector('.description, .synopsis, p')?.textContent?.trim(),
    cover_image: doc.querySelector('img.cover, .poster img, img')?.getAttribute('src'),
    banner_image: doc.querySelector('.banner img, .header-image img')?.getAttribute('src'),
    type: 'manga',
    status: 'ongoing',
    release_year: new Date().getFullYear(),
    rating: 0,
    author: doc.querySelector('.author, .writer')?.textContent?.trim(),
    artist: doc.querySelector('.artist, .illustrator')?.textContent?.trim()
  };

  // Insert manga
  const { data: insertedManga, error: mangaError } = await supabaseClient
    .from('manga')
    .insert([mangaData])
    .select()
    .single();

  if (mangaError) {
    console.error('Error inserting manga:', mangaError);
    throw mangaError;
  }

  console.log('Manga inserted:', insertedManga.id);

  // Extract chapters
  const chapterElements = doc.querySelectorAll('.chapter, .chapter-item, .chapter-link');
  for (let i = 0; i < chapterElements.length; i++) {
    const chapterEl = chapterElements[i];
    const chapterData = {
      manga_id: insertedManga.id,
      chapter_number: i + 1,
      title: chapterEl.querySelector('.chapter-title')?.textContent?.trim() || `Chapter ${i + 1}`,
      title_arabic: chapterEl.querySelector('.chapter-title-arabic')?.textContent?.trim(),
      thumbnail: chapterEl.querySelector('img')?.getAttribute('src')
    };

    const { data: insertedChapter, error: chapterError } = await supabaseClient
      .from('manga_chapters')
      .insert([chapterData])
      .select()
      .single();

    if (chapterError) {
      console.error('Error inserting chapter:', chapterError);
      continue;
    }

    // Extract pages (if available on the same page)
    const pageElements = chapterEl.querySelectorAll('img.page, .page img');
    for (let j = 0; j < pageElements.length; j++) {
      const pageImg = pageElements[j].getAttribute('src');
      if (pageImg) {
        await supabaseClient.from('manga_pages').insert([{
          chapter_id: insertedChapter.id,
          page_number: j + 1,
          image_url: pageImg
        }]);
      }
    }
  }

  // Extract genres
  const genreElements = doc.querySelectorAll('.genre, .tag, .category');
  for (let i = 0; i < genreElements.length; i++) {
    const genreName = genreElements[i].textContent?.trim();
    if (!genreName) continue;

    const { data: existingGenre } = await supabaseClient
      .from('genres')
      .select('id')
      .eq('name', genreName)
      .maybeSingle();

    let genreId = existingGenre?.id;

    if (!genreId) {
      const { data: newGenre } = await supabaseClient
        .from('genres')
        .insert([{ name: genreName }])
        .select('id')
        .single();
      
      genreId = newGenre?.id;
    }

    if (genreId) {
      await supabaseClient
        .from('manga_genres')
        .insert([{
          manga_id: insertedManga.id,
          genre_id: genreId
        }]);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      manga_id: insertedManga.id,
      message: 'تم سحب المانجا بنجاح'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
      
