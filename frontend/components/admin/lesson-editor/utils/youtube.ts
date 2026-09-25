/**
 * frontend/components/admin/lesson-editor/utils/youtube.ts
 * YouTube URL and Video ID parser matching Phase 2A backend normalization contract.
 */

export const YOUTUBE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const VALID_DOMAINS = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"];

export function extractYouTubeVideoId(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;

  // 1. Direct 11-char ID
  if (YOUTUBE_VIDEO_ID_REGEX.test(raw)) {
    return raw;
  }

  // 2. URL parsing
  try {
    let urlToParse = raw;
    if (!urlToParse.startsWith("http://") && !urlToParse.startsWith("https://")) {
      urlToParse = `https://${urlToParse}`;
    }
    const parsed = new URL(urlToParse);
    const hostname = parsed.hostname.toLowerCase();

    const isMatch = VALID_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith("." + d)
    );
    if (!isMatch) return null;

    let candidateId: string | null = null;

    if (hostname.includes("youtu.be")) {
      const parts = parsed.pathname.replace(/^\/+|\/+$/g, "").split("/");
      if (parts.length > 0 && parts[0]) {
        candidateId = parts[0];
      }
    } else if (hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        candidateId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/embed/")) {
        const parts = parsed.pathname.replace(/^\/+|\/+$/g, "").split("/");
        if (parts.length >= 2) {
          candidateId = parts[1];
        }
      } else if (parsed.pathname.startsWith("/shorts/")) {
        const parts = parsed.pathname.replace(/^\/+|\/+$/g, "").split("/");
        if (parts.length >= 2) {
          candidateId = parts[1];
        }
      }
    }

    if (candidateId && YOUTUBE_VIDEO_ID_REGEX.test(candidateId)) {
      return candidateId;
    }
  } catch {
    return null;
  }

  return null;
}

export function toCanonicalYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function toSafeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
}
