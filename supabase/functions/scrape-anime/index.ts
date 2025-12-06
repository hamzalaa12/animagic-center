// ===========================
//    SCRAPER – FIXED VERSION
// ===========================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36/deno-dom-wasm.ts";

function extractField(doc: any, label: string) {
  // يبحث داخل media-info
  const items = doc.querySelectorAll(".media-info li, .anime-info li, .details li");

  for (const item of items) {
    const text = item.textContent?.trim() || "";
    if (text.includes(label)) {
      const span = item.querySelector("span");
      return span?.textContent?.trim() || text.replace(label, "").trim();
    }
  }

  return null;
}

// Extract fallback by class names
function extractByClasses(doc: any, classes: string[]) {
  for (const cls of classes) {
    const el = doc.querySelector(cls);
    if (el) return el.textContent?.trim() || null;
  }
  return null;
}

serve(async (req) => {
  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ success: false, error: "No URL provided" }));
    }

    const html = await fetch(url).then((r) => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) {
      return new Response(JSON.stringify({ success: false, error: "Failed to parse HTML" }));
    }

    // ============================
    // NAME
    // ============================
    let name =
      extractByClasses(doc, [
        ".anime-title",
        ".entry-title",
        "h1",
        ".title",
        ".anime-name",
      ]) || "بدون اسم";

    // ============================
    // STORY / DESCRIPTION
    // ============================
    let story =
      extractByClasses(doc, [
        ".story",
        ".description",
        ".anime-story",
        ".content",
        ".synopsis",
        ".des",
      ]) || "— لا توجد قصة متوفرة —";

    // ============================
    // IMAGE POSTER
    // ============================
    let image = null;

    const img =
      doc.querySelector(".anime-img img, .poster img, .anime-cover img, img.cover") ||
      doc.querySelector("img");

    if (img) image = img.getAttribute("src");

    // ============================
    // TYPE (TV / MOVIE / OVA)
    // ============================
    let type = extractField(doc, "النوع")?.toLowerCase() || "tv";

    if (type.includes("movie") || type.includes("فيلم")) type = "movie";
    else if (type.includes("ova")) type = "ova";
    else if (type.includes("special")) type = "special";
    else type = "tv";

    // ============================
    // YEAR
    // ============================
    let year = extractField(doc, "السنة") || extractField(doc, "سنة الإنتاج") || "غير محدد";

    // ============================
    // STATUS (ongoing / completed)
    // ============================
    let statusRaw = extractField(doc, "الحالة") || "";
    let status = statusRaw.includes("مستمر")
      ? "ongoing"
      : statusRaw.includes("مكتمل")
      ? "completed"
      : "unknown";

    // ============================
    // STUDIO
    // ============================
    let studio = extractField(doc, "الاستديو") || "غير متوفر";

    // ============================
    // GENRES
    // ============================
    let genres = [];

    const genreList = doc.querySelectorAll(".genres a, .genre a, .tags a");
    genreList.forEach((g) => genres.push(g.textContent.trim()));

    // ============================
    // RETURN JSON RESPONSE
    // ============================
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          name,
          story,
          image,
          type,
          year,
          status,
          studio,
          genres,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
    );
  }
});
