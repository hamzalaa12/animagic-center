import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to decode Unicode escape sequences
function decodeUnicodeEscapes(text: string): string {
  if (!text) return text;
  
  try {
    // Handle both \uXXXX and &#xXXXX; formats
    return text
      .replace(/\\u([\d\w]{4})/gi, (match, grp) => String.fromCharCode(parseInt(grp, 16)))
      .replace(/&#x([\d\w]+);/gi, (match, grp) => String.fromCharCode(parseInt(grp, 16)))
      .replace(/&#(\d+);/g, (match, grp) => String.fromCharCode(parseInt(grp, 10)));
  } catch (e) {
    return text;
  }
}

// Helper function to clean text from unwanted content
function cleanText(text: string): string {
  if (!text) return text;
  
  // First decode Unicode escapes
  text = decodeUnicodeEscapes(text);
  
  // Remove script tags and their content
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove style tags and their content
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove inline JavaScript objects and functions
  text = text.replace(/var\s+\w+\s*=\s*{[\s\S]*?};/g, '');
  text = text.replace(/function\s+\w+\s*\([^)]*\)\s*{[\s\S]*?}/g, '');
  
  // Remove WordPress-specific content
  text = text.replace(/wpdiscuz[^}]*}/gi, '');
  text = text.replace(/wpDiscuz[^}]*}/gi, '');
  text = text.replace(/wp\.[^;]*;/g, '');
  text = text.replace(/jQuery[^;]*;/g, '');
  
  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove excessive whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Helper function to get image URL from element (supports lazy loading)
function getImageUrl(element: any, baseUrl: string): string | null {
  if (!element) return null;
  
  const sources = [
    element.getAttribute('src'),
    element.getAttribute('data-src'),
    element.getAttribute('data-lazy-src'),
    element.getAttribute('data-original'),
    element.getAttribute('data-srcset')?.split(',')[0]?.split(' ')[0]
  ];
  
  for (const src of sources) {
    if (src && src.trim()) {
      let url = src.trim();
      
      // Make URL absolute
      if (url.startsWith('//')) {
        url = 'https:' + url;
      } else if (url.startsWith('/')) {
        const urlObj = new URL(baseUrl);
        url = `${urlObj.protocol}//${urlObj.host}${url}`;
      } else if (!url.startsWith('http')) {
        const urlObj = new URL(baseUrl);
        url = `${urlObj.protocol}//${urlObj.host}/${url}`;
      }
      
      // Filter out unwanted images
      const lowercaseUrl = url.toLowerCase();
      if (!lowercaseUrl.includes('icon') && 
          !lowercaseUrl.includes('logo') && 
          !lowercaseUrl.includes('avatar') &&
          !lowercaseUrl.includes('emoji') &&
          !lowercaseUrl.includes('1x1') &&
          !lowercaseUrl.includes('placeholder')) {
        return url;
      }
    }
  }
  
  return null;
}

// Helper function to add delay between requests
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

    // Add random delay to avoid rate limiting
    await delay(Math.random() * 1000 + 500);

    // Fetch HTML content with enhanced headers to bypass basic protections
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'ar-SA,ar;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'DNT': '1',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      throw new Error(`فشل في الوصول للصفحة. الموقع قد يكون محمي بـ Cloudflare أو يتطلب متصفح حقيقي. حاول نسخ المحتوى يدوياً.`);
    }

    const html = await response.text();
    console.log('Received HTML, length:', html.length);

    // Parse HTML (do NOT clean it before parsing - we need the structure)
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
  
  // Extract anime data with improved selectors for Arabic anime sites
  const titleElement = doc.querySelector('h1.entry-title, h1.title, .anime-title, .post-title, .single-title, .page-title, article h1, h1');
  let rawTitle = titleElement?.textContent?.trim().replace(/\s+/g, ' ') || '';
  
  // Decode and clean title
  rawTitle = decodeUnicodeEscapes(rawTitle);
  let title = rawTitle.replace(/مشاهدة|تحميل|أنمي|anime|مترجم|اون لاين|أونلاين|جميع حلقات/gi, '').trim() || rawTitle || 'Untitled';
  
  // Try to extract Arabic title
  let title_arabic = null;
  const metaArabicTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
  if (metaArabicTitle && /[\u0600-\u06FF]/.test(metaArabicTitle)) {
    const decodedMetaTitle = decodeUnicodeEscapes(metaArabicTitle);
    title_arabic = decodedMetaTitle.replace(/مشاهدة|تحميل|أنمي|anime|مترجم|اون لاين|جميع حلقات/gi, '').trim();
  }
  
  // Look for Arabic text in title
  const arabicInTitle = rawTitle.match(/[\u0600-\u06FF\s،؛]+/)?.[0]?.trim();
  if (!title_arabic && arabicInTitle && arabicInTitle.length > 3) {
    title_arabic = arabicInTitle;
  }
  
  // Try alternative selectors for Arabic title
  if (!title_arabic) {
    const arabicTitleEl = doc.querySelector('.arabic-title, [lang="ar"]');
    if (arabicTitleEl) {
      title_arabic = decodeUnicodeEscapes(arabicTitleEl.textContent?.trim() || '');
    }
  }
  
  // Extract description
  let description = null;
  const metaDesc = doc.querySelector('meta[name="description"], meta[property="og:description"]')?.getAttribute('content');
  if (metaDesc && metaDesc.length > 20) {
    description = decodeUnicodeEscapes(metaDesc.trim());
  } else {
    const descElement = doc.querySelector('.story-content, .entry-content > p, .description, .synopsis, .anime-description, .summary, article > p, .post-content > p, .ssynopsis');
    if (descElement) {
      let rawDesc = descElement.textContent?.trim() || '';
      description = decodeUnicodeEscapes(rawDesc);
    }
  }
  
  // Final description cleanup and length limit
  if (description && description.length > 20) {
    // Remove excessive whitespace
    description = description.replace(/\s+/g, ' ').trim().substring(0, 1000);
  } else {
    description = null;
  }
  
  // Extract images with enhanced support for lazy loading
  const coverImg = doc.querySelector('.poster img, .cover-image img, .thumbnail img, .anime-image img, .series-image img, article img:first-of-type, .post-thumbnail img, img[class*="cover"], img[class*="poster"]');
  const cover_image = getImageUrl(coverImg, url);
  
  const bannerImg = doc.querySelector('.banner img, .header-image img, .featured-image img, .backdrop img');
  const banner_image = getImageUrl(bannerImg, url) || cover_image;
  
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

  // Extract seasons and episodes with better selectors
  const seasonElements = doc.querySelectorAll('.season, .season-item, .seasons-list > li, .season-block, [id*="season"], [class*="season-"]');
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

      // Extract episodes for this season with improved selectors
      const episodeElements = seasonEl.querySelectorAll('.episode, .episode-item, .episodes-list > li, .episode-block, a[href*="episode"], a[href*="الحلقة"], [class*="episode-"], [id*="episode"]');
      console.log(`Season ${i + 1} - Found episodes:`, episodeElements.length);
      
      for (let j = 0; j < episodeElements.length; j++) {
      const episodeEl = episodeElements[j];
      let episodeTitle = episodeEl.querySelector('.episode-title, .title, span, strong')?.textContent?.trim() || `Episode ${j + 1}`;
      episodeTitle = decodeUnicodeEscapes(episodeTitle);
        const episodeThumbnail = getImageUrl(episodeEl.querySelector('img'), url);
        
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

        // Extract video servers with better logic
        const serverLinks = episodeEl.querySelectorAll('a[href*="watch"], a[href*="video"], a[href*="player"], .server-link, .servers a, [class*="server"] a, .quality-buttons a');
        console.log(`Episode ${j + 1} - Found servers:`, serverLinks.length);
        
        for (let k = 0; k < serverLinks.length; k++) {
          const serverLink = serverLinks[k];
          let serverName = serverLink.textContent?.trim() || serverLink.getAttribute('title') || serverLink.getAttribute('data-server') || `السيرفر ${k + 1}`;
          serverName = decodeUnicodeEscapes(serverName);
          let videoUrl = serverLink.getAttribute('href') || serverLink.getAttribute('data-url') || '';
          
          // Make URL absolute if needed
          if (videoUrl && videoUrl.startsWith('/')) {
            const urlObj = new URL(url);
            videoUrl = `${urlObj.protocol}//${urlObj.host}${videoUrl}`;
          } else if (videoUrl && !videoUrl.startsWith('http')) {
            const urlObj = new URL(url);
            videoUrl = `${urlObj.protocol}//${urlObj.host}/${videoUrl}`;
          }
          
          if (videoUrl && videoUrl.length > 10) {
            const serverData = {
              episode_id: insertedEpisode.id,
              server_name: serverName.substring(0, 100),
              video_url: videoUrl,
              quality: '1080p'
            };

            await supabaseClient.from('video_servers').insert([serverData]);
          }
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
      const episodeElements = doc.querySelectorAll('.episode, .episode-item, .episodes-list > li, .episode-block, a[href*="episode"], a[href*="الحلقة"], [class*="episode-"], [id*="episode"]');
      console.log('Found episodes in page:', episodeElements.length);
      
      for (let j = 0; j < episodeElements.length; j++) {
        const episodeEl = episodeElements[j];
        let episodeTitle = episodeEl.querySelector('.episode-title, .title, span, strong')?.textContent?.trim() || `Episode ${j + 1}`;
        episodeTitle = decodeUnicodeEscapes(episodeTitle);
        const episodeThumbnail = getImageUrl(episodeEl.querySelector('img'), url);
        
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
          const serverLinks = episodeEl.querySelectorAll('a[href*="watch"], a[href*="video"], a[href*="player"], .server-link, .servers a, [class*="server"] a');
          for (let k = 0; k < serverLinks.length; k++) {
            const serverLink = serverLinks[k];
            let videoUrl = serverLink.getAttribute('href') || serverLink.getAttribute('data-url') || '';
            
            if (videoUrl && videoUrl.startsWith('/')) {
              const urlObj = new URL(url);
              videoUrl = `${urlObj.protocol}//${urlObj.host}${videoUrl}`;
            }
            
            if (videoUrl && videoUrl.length > 10) {
              const serverData = {
                episode_id: insertedEpisode.id,
                server_name: serverLink.textContent?.trim() || `السيرفر ${k + 1}`,
                video_url: videoUrl,
                quality: '1080p'
              };
              await supabaseClient.from('video_servers').insert([serverData]);
            }
          }
        }
      }
    }
  }

  // Extract genres with better selectors
  const genreElements = doc.querySelectorAll('.genre, .tag, .category, .genres a, .tags a, .terms a, [class*="genre"] a, [class*="tag"] a, [rel="tag"]');
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
  
  // Extract manga data with improved selectors for Arabic manga sites
  const titleElement = doc.querySelector('h1.entry-title, h1.post-title, h1.title, .manga-title, .post-title-content, .single-title, article h1, h1');
  let rawTitle = titleElement?.textContent?.trim().replace(/\s+/g, ' ') || '';
  
  // Decode and clean title
  rawTitle = decodeUnicodeEscapes(rawTitle);
  let title = rawTitle.replace(/مانجا|مانهوا|مانها|manga|manhwa|manhua|مترجم|اون لاين|قراءة/gi, '').trim() || rawTitle || 'Untitled';
  
  // Try to extract Arabic title
  let title_arabic = null;
  const metaArabicTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
  if (metaArabicTitle && /[\u0600-\u06FF]/.test(metaArabicTitle)) {
    const decodedMetaTitle = decodeUnicodeEscapes(metaArabicTitle);
    title_arabic = decodedMetaTitle.replace(/مانجا|مانهوا|مانها|manga|manhwa|manhua|مترجم|اون لاين/gi, '').trim();
  }
  
  // Look for Arabic text in title
  const arabicInTitle = rawTitle.match(/[\u0600-\u06FF\s،؛]+/)?.[0]?.trim();
  if (!title_arabic && arabicInTitle && arabicInTitle.length > 3) {
    title_arabic = arabicInTitle;
  }
  
  // Extract description
  let description = null;
  const metaDesc = doc.querySelector('meta[name="description"], meta[property="og:description"]')?.getAttribute('content');
  if (metaDesc && metaDesc.length > 20) {
    description = decodeUnicodeEscapes(metaDesc.trim());
  } else {
    const descElement = doc.querySelector('.story-content, .entry-content > p, .description, .synopsis, .summary, .manga-description, .manga-excerpt, article > p, .post-content > p, .summary__content, .dsct');
    if (descElement) {
      let rawDesc = descElement.textContent?.trim() || '';
      description = decodeUnicodeEscapes(rawDesc);
    }
  }
  
  // Final description cleanup
  if (description && description.length > 20) {
    // Remove excessive whitespace
    description = description.replace(/\s+/g, ' ').trim().substring(0, 1000);
  } else {
    description = null;
  }
  
  // Extract images with enhanced lazy loading support
  const coverImg = doc.querySelector('.poster img, .cover-image img, .thumbnail img, .summary_image img, .manga-image img, .series-thumbnail img, article img:first-of-type, img[class*="cover"]');
  const cover_image = getImageUrl(coverImg, url);
  
  const bannerImg = doc.querySelector('.banner img, .header-image img, .featured-image img, .backdrop img');
  const banner_image = getImageUrl(bannerImg, url) || cover_image;
  
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
  let author = authorElement?.textContent?.trim()?.replace(/author:?/i, '').trim() || null;
  if (author) author = decodeUnicodeEscapes(author);
  
  const artistElement = doc.querySelector('.artist, .illustrator, [class*="artist"]');
  let artist = artistElement?.textContent?.trim()?.replace(/artist:?/i, '').trim() || null;
  if (artist) artist = decodeUnicodeEscapes(artist);
  
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

  // Extract chapters with better selectors and deduplication
  const chapterElements = doc.querySelectorAll('.chapter, .chapter-item, .wp-manga-chapter, .chapters-list > li, .chapter-link, a[href*="chapter"], a[href*="الفصل"], [class*="chapter-"], li.wp-manga-chapter');
  console.log('Found chapters:', chapterElements.length);
  
  // Track processed chapters to avoid duplicates
  const processedChapters = new Set<string>();
  
  for (let i = 0; i < chapterElements.length; i++) {
    const chapterEl = chapterElements[i];
    const chapterLink = chapterEl.querySelector('a') || (chapterEl.tagName === 'A' ? chapterEl : null);
    let chapterTitle = chapterLink?.textContent?.trim() || chapterEl.textContent?.trim() || `الفصل ${i + 1}`;
    chapterTitle = decodeUnicodeEscapes(chapterTitle);
    
    // Extract chapter number from title if possible
    const chapterNumMatch = chapterTitle.match(/chapter\s*(\d+(?:\.\d+)?)/i) || chapterTitle.match(/الفصل\s*(\d+(?:\.\d+)?)/);
    const chapter_number = chapterNumMatch ? parseFloat(chapterNumMatch[1]) : i + 1;
    
    // Create unique identifier for chapter
    const chapterIdentifier = `${chapter_number}`;
    
    // Skip if already processed
    if (processedChapters.has(chapterIdentifier)) {
      console.log(`Skipping duplicate chapter: ${chapter_number}`);
      continue;
    }
    processedChapters.add(chapterIdentifier);
    
    const chapterThumbnail = getImageUrl(chapterEl.querySelector('img'), url);
    
    // Get chapter URL for potential page extraction
    let chapterUrl = chapterLink?.getAttribute('href');
    if (chapterUrl && chapterUrl.startsWith('/')) {
      const urlObj = new URL(url);
      chapterUrl = `${urlObj.protocol}//${urlObj.host}${chapterUrl}`;
    }
    
    const chapterData = {
      manga_id: insertedManga.id,
      chapter_number,
      title: chapterTitle.substring(0, 255),
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

    // Try to extract pages from the chapter element or fetch chapter page
    let pageElements = chapterEl.querySelectorAll('img.page, .page img, .reading-content img, .chapter-content img, .page-break img');
    
    // If no pages found in listing, try to fetch the chapter page
    if (pageElements.length === 0 && chapterUrl) {
      try {
        console.log(`Fetching chapter page: ${chapterUrl}`);
        
        // Add delay to avoid rate limiting
        await delay(Math.random() * 1000 + 1000);
        
        const chapterResponse = await fetch(chapterUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ar-SA,ar;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': url,
            'DNT': '1'
          }
        });
        
        if (chapterResponse.ok) {
          const chapterHtml = await chapterResponse.text();
          const chapterDoc = new DOMParser().parseFromString(chapterHtml, 'text/html');
          
          if (chapterDoc) {
            pageElements = chapterDoc.querySelectorAll('img.page, .page img, .reading-content img, .chapter-content img, .page-break img, #readerarea img, .reader-area img, .entry-content img, .wp-manga-chapter-img');
          }
        }
      } catch (e) {
        console.error('Failed to fetch chapter page:', e);
      }
    }
    
    console.log(`Chapter ${chapter_number} - Found pages:`, pageElements.length);
    
    // Collect all valid page images first to avoid duplicates
    const pageImages: Array<{url: string, number: number}> = [];
    const seenUrls = new Set<string>();
    
    for (let j = 0; j < pageElements.length; j++) {
      const pageImg = getImageUrl(pageElements[j], chapterUrl || url);
      
      if (pageImg && !seenUrls.has(pageImg)) {
        seenUrls.add(pageImg);
        pageImages.push({ url: pageImg, number: j + 1 });
      }
    }
    
    // Insert all pages for this chapter
    console.log(`Inserting ${pageImages.length} unique pages for chapter ${chapter_number}`);
    
    for (const page of pageImages) {
      await supabaseClient.from('manga_pages').insert([{
        chapter_id: insertedChapter.id,
        page_number: page.number,
        image_url: page.url
      }]);
    }
  }

  // Extract genres
  const genreElements = doc.querySelectorAll('.genre, .tag, .category, .genres a, .tags a, .wp-manga-tags a, .terms a, [class*="genre"] a, [rel="tag"]');
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
      
