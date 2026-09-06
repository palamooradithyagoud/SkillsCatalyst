/**
 * YouTube IFrame API script loader (global singleton)
 * Loads the YT IFrame API script once and notifies queued callbacks.
 */

// ── YouTube IFrame API type stubs ────────────────────────────────────────────
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | undefined;
    _ytApiLoading: boolean;
    _ytApiReady: boolean;
    _ytReadyCallbacks: Array<() => void>;
  }
}

export declare namespace YT {
  const enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): PlayerState;
    destroy(): void;
  }

  interface PlayerOptions {
    videoId: string;
    width?: string | number;
    height?: string | number;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: (event: { target: Player }) => void;
      onStateChange?: (event: { data: number; target: Player }) => void;
    };
  }

  class Player {
    constructor(elementId: string, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): number;
    destroy(): void;
  }
}

// Player state numeric constants (safe across runtimes)
export const YT_ENDED = 0;
export const YT_PLAYING = 1;
export const YT_PAUSED = 2;
export const YT_BUFFERING = 3;

/**
 * Global singleton loader for the YouTube IFrame API.
 * Ensures the <script> tag is injected only once and multiple hook mounts are queued safely.
 */
export function loadYTApi(onReady: () => void): void {
  if (typeof window === "undefined") return;

  // Already fully loaded
  if (window._ytApiReady && window.YT?.Player) {
    onReady();
    return;
  }

  // Queue the callback
  if (!window._ytReadyCallbacks) window._ytReadyCallbacks = [];
  window._ytReadyCallbacks.push(onReady);

  // Patch onYouTubeIframeAPIReady so multiple hooks are safe
  if (!window.onYouTubeIframeAPIReady) {
    window.onYouTubeIframeAPIReady = () => {
      window._ytApiReady = true;
      (window._ytReadyCallbacks ?? []).forEach((cb) => cb());
      window._ytReadyCallbacks = [];
    };
  }

  // Only inject script once
  if (!window._ytApiLoading) {
    window._ytApiLoading = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}
