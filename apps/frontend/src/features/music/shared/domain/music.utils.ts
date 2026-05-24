import type { Playlist } from './music.types';

export interface PlaylistTrack {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  source: 'youtube' | 'local' | 'link';
  sourceLabel: string;
  durationSeconds: number;
  coverImage: string | null;
  gradientClassName: string;
}

const playlistGradients = [
  'from-sky-500/85 via-cyan-400/70 to-emerald-300/80',
  'from-slate-900 via-sky-700/90 to-cyan-300/70',
  'from-emerald-500/85 via-teal-400/75 to-sky-300/70',
  'from-amber-400/80 via-rose-400/70 to-fuchsia-500/75',
  'from-indigo-500/75 via-sky-500/70 to-cyan-300/75',
  'from-zinc-900 via-emerald-700/85 to-cyan-400/70',
];

const coverGradients = [
  'from-white/25 via-white/5 to-black/30',
  'from-cyan-200/30 via-transparent to-slate-950/35',
  'from-emerald-200/35 via-transparent to-slate-900/40',
  'from-rose-200/25 via-transparent to-violet-950/35',
  'from-amber-200/30 via-transparent to-zinc-950/40',
  'from-sky-100/30 via-transparent to-slate-950/45',
];

function hashValue(value: string) {
  return Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0);
}

function parseUrl(value: string) {
  try {
    return new URL(value, 'https://focusflow.local');
  } catch {
    return null;
  }
}

function isOpaqueId(value: string) {
  return /^[a-zA-Z0-9_-]{14,}$/.test(value);
}

function humanize(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function extractYouTubeId(value: string) {
  const match = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/,
  );

  return match?.[1] ?? null;
}

function prettifySegment(segment: string) {
  return decodeURIComponent(segment)
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getPlaylistGradient(seed: string) {
  return playlistGradients[hashValue(seed) % playlistGradients.length];
}

function getCoverGradient(seed: string) {
  return coverGradients[hashValue(seed) % coverGradients.length];
}

export function getPlaylistMood(playlist: Playlist) {
  const tracks = playlist.urls.length;

  if (tracks === 0) {
    return 'Silence curated for your next deep-work session';
  }

  if (tracks <= 3) {
    return 'Short reset set with a calm, intentional arc';
  }

  if (tracks <= 8) {
    return 'Balanced focus mix for steady afternoons';
  }

  return 'Long-form flow designed for deep, uninterrupted work';
}

export function getPlaylistArtwork(urls: string[], seed: string) {
  const firstTrack = urls.find(Boolean);
  const youtubeId = firstTrack ? extractYouTubeId(firstTrack) : null;

  if (youtubeId) {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  return null;
}

function detectSource(url: string): PlaylistTrack['source'] {
  if (extractYouTubeId(url)) {
    return 'youtube';
  }

  if (/^(\/|\.\/|\.\.\/|file:\/\/)/i.test(url)) {
    return 'local';
  }

  return 'link';
}

function getTrackTitle(url: string, index: number) {
  const parsedUrl = parseUrl(url);

  if (parsedUrl) {
    const host = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    const lastSegment = segments.at(-1) ?? '';

    if (host.includes('spotify.com')) {
      if (segments[0] === 'playlist') return 'Spotify Playlist';
      if (segments[0] === 'track') return 'Spotify Track';
      if (segments[0] === 'album') return 'Spotify Album';
      if (segments[0] === 'artist') return 'Spotify Artist';
      return 'Spotify Link';
    }

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      if (parsedUrl.searchParams.get('list')) return 'YouTube Playlist';
      if (extractYouTubeId(url)) return `YouTube Session ${index + 1}`;
      return 'YouTube Link';
    }

    if (host.includes('soundcloud.com')) {
      return 'SoundCloud Track';
    }

    if (lastSegment && !isOpaqueId(lastSegment)) {
      const title = prettifySegment(lastSegment);
      if (title) {
        return humanize(title);
      }
    }

    return `${humanize(host.split('.').slice(0, 2).join(' '))} Link`;
  }

  const fallback = prettifySegment(url);
  if (fallback && !isOpaqueId(fallback)) {
    return humanize(fallback);
  }

  return `Track ${index + 1}`;
}

function getTrackSubtitle(url: string, source: PlaylistTrack['source']) {
  const parsedUrl = parseUrl(url);

  if (parsedUrl) {
    const host = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();
    const segments = parsedUrl.pathname.split('/').filter(Boolean);

    if (host.includes('spotify.com') && segments[0]) {
      return `${humanize(segments[0])} • ${parsedUrl.hostname.replace(/^www\./, '')}`;
    }

    if ((host.includes('youtube.com') || host.includes('youtu.be')) && parsedUrl.searchParams.get('list')) {
      return 'Playlist link';
    }
  }

  if (source === 'youtube') {
    return 'YouTube link';
  }

  if (source === 'local') {
    return 'Local or direct file';
  }

  return parsedUrl?.hostname?.replace(/^www\./, '') || 'External link';
}

function getTrackDuration(url: string, index: number) {
  return 140 + ((hashValue(url) + index * 29) % 180);
}

export function trackUrlsToItems(urls: string[]) {
  return urls
    .map((value) => value.trim())
    .filter(Boolean)
    .map<PlaylistTrack>((url, index) => {
      const source = detectSource(url);
      const youtubeId = extractYouTubeId(url);

      return {
        id: `${index}-${url}`,
        url,
        title: getTrackTitle(url, index),
        subtitle: getTrackSubtitle(url, source),
        source,
        sourceLabel: source === 'youtube' ? 'YouTube' : source === 'local' ? 'Local file' : 'Link',
        durationSeconds: getTrackDuration(url, index),
        coverImage: youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null,
        gradientClassName: getCoverGradient(`${url}-${index}`),
      };
    });
}

export function getPlaylistDuration(tracks: PlaylistTrack[]) {
  return tracks.reduce((total, track) => total + track.durationSeconds, 0);
}

export function sanitizePlaylistPayload(values: {
  name: string;
  description?: string;
  urls: string[];
}) {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    urls: values.urls.map((value) => value.trim()).filter(Boolean),
  };
}