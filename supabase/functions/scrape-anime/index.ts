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
  console.log('Starting anime scrape from URL:', url);
  
  // Extract anime data with multiple selector strategies
  const titleElement = doc.querySelector('h1.entry-title, h1.title, .anime-title, h1, .post-title');
  const title = titleElement?.textContent?.trim() || 'Untitled';
  
  const titleArabicElement = doc.querySelector('.arabic-title, .title-arabic, [lang="ar"]');
  const title_arabic = titleArabicElement?.textContent?.trim();
  
  const descElement = doc.querySelector('.entry-content, .description, .synopsis, .story, article p, .content p');
  const description = descElement?.textContent?.trim();
  
  // Try multiple image selectors
  const coverImg = doc.querySelector('.poster img, .cover-image img, .thumbnail img, article img, .post-thumbnail img, img[class*="cover"], img[class*="poster"]');
  const cover_image = coverImg?.getAttribute('src') || coverImg?.getAttribute('data-src');
  
  const bannerImg = doc.querySelector('.banner img, .header-image img, .featured-image img');
  const banner_image = bannerImg?.getAttribute('src') || bannerImg?.getAttribute('data-src') || cover_image;
  
  // Extract type (tv, movie, ova)
  const typeElement = doc.querySelector('.type, .anime-type, [class*="type"]');
  const typeText = typeElement?.textContent?.trim()?.toLowerCase();
  let type = 'tv';
  if (typeText?.includes('movie') || typeText?.includes('فيلم')) type = 'movie';
  else if (typeText?.includes('ova')) type = 'ova';
  
  // Extract status
  const statusElement = doc.querySelector('.status, .anime-status, [class*="status"]');
  const statusText = statusElement?.textContent?.trim()?.toLowerCase();
  let status = 'ongoing';
  if (statusText?.includes('completed') || statusText?.includes('مكتمل')) status = 'completed';
  else if (statusText?.includes('upcoming') || statusText?.includes('قادم')) status = 'upcoming';
  
  // Extract release year
  const yearElement = doc.querySelector('.year, .release-year, [class*="year"], time');
  const yearText = yearElement?.textContent?.trim();
  const yearMatch = yearText?.match(/\d{4}/);
  const release_year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
  
  // Extract rating
  const ratingElement = doc.querySelector('.rating, .score, [class*="rating"]');
  const ratingText = ratingElement?.textContent?.trim();
  const ratingMatch = ratingText?.match(/[\d.]+/);
  const rating = ratingMatch ? parseFloat(ratingMatch[0]) : 0;
  
  console.log('Extracted anime data:', { title, title_arabic, type, status, release_year, rating });
  
  const animeData = {
    title,
    title_arabic,
    description,
    cover_image,
    banner_image,
    type,
    status,
    release_year,
    rating
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
  const seasonElements = doc.querySelectorAll('.season, .season-item, .seasons-list li, [class*="season"]');
  console.log('Found seasons:', seasonElements.length);
  
  if (seasonElements && seasonElements.length > 0) {
    for (let i = 0; i < seasonElements.length; i++) {
      const seasonEl = seasonElements[i];
      const seasonTitle = seasonEl.querySelector('.season-title, h3, h4')?.textContent?.trim() || `Season ${i + 1}`;
      
      const seasonData = {
        anime_id: insertedAnime.id,
        season_number: i + 1,
        title: seasonTitle,
        title_arabic: seasonEl.querySelector('.season-title-arabic, [lang="ar"]')?.textContent?.trim() || `الموسم ${i + 1}`
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
      const episodeElements = seasonEl.querySelectorAll('.episode, .episode-item, .episodes-list li, a[href*="episode"], [class*="episode"]');
      console.log(`Season ${i + 1} - Found episodes:`, episodeElements.length);
      
      for (let j = 0; j < episodeElements.length; j++) {
        const episodeEl = episodeElements[j];
        const episodeTitle = episodeEl.querySelector('.episode-title, .title, span, strong')?.textContent?.trim() || `Episode ${j + 1}`;
        const episodeThumbnail = episodeEl.querySelector('img')?.getAttribute('src') || episodeEl.querySelector('img')?.getAttribute('data-src');
        
        const episodeData = {
          season_id: insertedSeason.id,
          episode_number: j + 1,
          title: episodeTitle,
          title_arabic: episodeEl.querySelector('.episode-title-arabic, [lang="ar"]')?.textContent?.trim(),
          thumbnail: episodeThumbnail
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
        const serverLinks = episodeEl.querySelectorAll('a[href*="watch"], a[href*="video"], .server-link, .servers a, [class*="server"] a');
        console.log(`Episode ${j + 1} - Found servers:`, serverLinks.length);
        
        for (let k = 0; k < serverLinks.length; k++) {
          const serverLink = serverLinks[k];
          const serverName = serverLink.textContent?.trim() || serverLink.getAttribute('title') || `Server ${k + 1}`;
          const videoUrl = serverLink.getAttribute('href') || '';
          
          const serverData = {
            episode_id: insertedEpisode.id,
            server_name: serverName,
            video_url: videoUrl,
            quality: '1080p'
          };

          await supabaseClient.from('video_servers').insert([serverData]);
        }
      }
    }
  } else {
    // If no seasons found, create a default season and try to extract episodes directly
    console.log('No seasons found, creating default season');
    const defaultSeasonData = {
      anime_id: insertedAnime.id,
      season_number: 1,
      title: 'Season 1',
      title_arabic: 'الموسم 1'
    };

    const { data: defaultSeason, error: seasonError } = await supabaseClient
      .from('seasons')
      .insert([defaultSeasonData])
      .select()
      .single();

    if (!seasonError && defaultSeason) {
      const episodeElements = doc.querySelectorAll('.episode, .episode-item, .episodes-list li, a[href*="episode"], [class*="episode"]');
      console.log('Found episodes in page:', episodeElements.length);
      
      for (let j = 0; j < episodeElements.length; j++) {
        const episodeEl = episodeElements[j];
        const episodeTitle = episodeEl.querySelector('.episode-title, .title, span, strong')?.textContent?.trim() || `Episode ${j + 1}`;
        const episodeThumbnail = episodeEl.querySelector('img')?.getAttribute('src') || episodeEl.querySelector('img')?.getAttribute('data-src');
        
        const episodeData = {
          season_id: defaultSeason.id,
          episode_number: j + 1,
          title: episodeTitle,
          title_arabic: episodeEl.querySelector('.episode-title-arabic, [lang="ar"]')?.textContent?.trim(),
          thumbnail: episodeThumbnail
        };

        const { data: insertedEpisode, error: episodeError } = await supabaseClient
          .from('episodes')
          .insert([episodeData])
          .select()
          .single();

        if (!episodeError && insertedEpisode) {
          const serverLinks = episodeEl.querySelectorAll('a[href*="watch"], a[href*="video"], .server-link, .servers a');
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
  }

  // Extract genres
  const genreElements = doc.querySelectorAll('.genre, .tag, .category, .genres a, .tags a, [class*="genre"] a, [class*="tag"] a');
  console.log('Found genres:', genreElements.length);
  
  for (let i = 0; i < genreElements.length; i++) {
    const genreName = genreElements[i].textContent?.trim();
    if (!genreName || genreName.length < 2) continue;

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
  console.log('Starting manga scrape from URL:', url);
  
  // Extract manga data with multiple selector strategies
  const titleElement = doc.querySelector('h1.entry-title, h1.post-title, h1.title, .manga-title, h1');
  const title = titleElement?.textContent?.trim() || 'Untitled';
  
  const titleArabicElement = doc.querySelector('.arabic-title, .title-arabic, [lang="ar"]');
  const title_arabic = titleArabicElement?.textContent?.trim();
  
  const descElement = doc.querySelector('.entry-content, .description, .synopsis, .summary, article p, .content p');
  const description = descElement?.textContent?.trim();
  
  const coverImg = doc.querySelector('.poster img, .cover-image img, .thumbnail img, .summary_image img, article img, img[class*="cover"]');
  const cover_image = coverImg?.getAttribute('src') || coverImg?.getAttribute('data-src');
  
  const bannerImg = doc.querySelector('.banner img, .header-image img, .featured-image img');
  const banner_image = bannerImg?.getAttribute('src') || bannerImg?.getAttribute('data-src') || cover_image;
  
  // Extract type (manga, manhwa, manhua)
  const typeElement = doc.querySelector('.type, .manga-type, [class*="type"]');
  const typeText = typeElement?.textContent?.trim()?.toLowerCase();
  let type = 'manga';
  if (typeText?.includes('manhwa') || typeText?.includes('مانهوا')) type = 'manhwa';
  else if (typeText?.includes('manhua') || typeText?.includes('مانها')) type = 'manhua';
  
  // Extract status
  const statusElement = doc.querySelector('.status, .manga-status, [class*="status"]');
  const statusText = statusElement?.textContent?.trim()?.toLowerCase();
  let status = 'ongoing';
  if (statusText?.includes('completed') || statusText?.includes('مكتمل')) status = 'completed';
  else if (statusText?.includes('upcoming') || statusText?.includes('قادم')) status = 'upcoming';
  
  // Extract release year
  const yearElement = doc.querySelector('.year, .release-year, [class*="year"], time');
  const yearText = yearElement?.textContent?.trim();
  const yearMatch = yearText?.match(/\d{4}/);
  const release_year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
  
  // Extract rating
  const ratingElement = doc.querySelector('.rating, .score, [class*="rating"]');
  const ratingText = ratingElement?.textContent?.trim();
  const ratingMatch = ratingText?.match(/[\d.]+/);
  const rating = ratingMatch ? parseFloat(ratingMatch[0]) : 0;
  
  // Extract author and artist
  const authorElement = doc.querySelector('.author, .writer, [class*="author"]');
  const author = authorElement?.textContent?.trim()?.replace(/author:?/i, '').trim();
  
  const artistElement = doc.querySelector('.artist, .illustrator, [class*="artist"]');
  const artist = artistElement?.textContent?.trim()?.replace(/artist:?/i, '').trim();
  
  console.log('Extracted manga data:', { title, title_arabic, type, status, release_year, rating, author, artist });
  
  const mangaData = {
    title,
    title_arabic,
    description,
    cover_image,
    banner_image,
    type,
    status,
    release_year,
    rating,
    author,
    artist
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
  const chapterElements = doc.querySelectorAll('.chapter, .chapter-item, .wp-manga-chapter, .chapters-list li, a[href*="chapter"], [class*="chapter"]');
  console.log('Found chapters:', chapterElements.length);
  
  for (let i = 0; i < chapterElements.length; i++) {
    const chapterEl = chapterElements[i];
    const chapterTitle = chapterEl.querySelector('.chapter-title, a, span')?.textContent?.trim() || `Chapter ${i + 1}`;
    
    // Extract chapter number from title if possible
    const chapterNumMatch = chapterTitle.match(/chapter\s*(\d+)/i) || chapterTitle.match(/الفصل\s*(\d+)/);
    const chapter_number = chapterNumMatch ? parseFloat(chapterNumMatch[1]) : i + 1;
    
    const chapterThumbnail = chapterEl.querySelector('img')?.getAttribute('src') || chapterEl.querySelector('img')?.getAttribute('data-src');
    
    const chapterData = {
      manga_id: insertedManga.id,
      chapter_number,
      title: chapterTitle,
      title_arabic: chapterEl.querySelector('.chapter-title-arabic, [lang="ar"]')?.textContent?.trim(),
      thumbnail: chapterThumbnail
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
    const pageElements = chapterEl.querySelectorAll('img.page, .page img, .reading-content img, .chapter-content img');
    console.log(`Chapter ${i + 1} - Found pages:`, pageElements.length);
    
    for (let j = 0; j < pageElements.length; j++) {
      const pageImg = pageElements[j].getAttribute('src') || pageElements[j].getAttribute('data-src');
      if (pageImg && !pageImg.includes('icon') && !pageImg.includes('logo')) {
        await supabaseClient.from('manga_pages').insert([{
          chapter_id: insertedChapter.id,
          page_number: j + 1,
          image_url: pageImg
        }]);
      }
    }
  }

  // Extract genres
  const genreElements = doc.querySelectorAll('.genre, .tag, .category, .genres a, .tags a, .wp-manga-tags a, [class*="genre"] a');
  console.log('Found manga genres:', genreElements.length);
  
  for (let i = 0; i < genreElements.length; i++) {
    const genreName = genreElements[i].textContent?.trim();
    if (!genreName || genreName.length < 2) continue;

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
      
