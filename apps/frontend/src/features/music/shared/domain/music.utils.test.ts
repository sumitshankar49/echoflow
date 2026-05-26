import { describe, expect, it } from 'vitest';

import {
  extractPlaylistMood,
  formatTime,
  getPlaylistArtwork,
  getPlaylistDuration,
  getPlaylistGradient,
  getPlaylistMood,
  getPlaylistMoodCategory,
  sanitizePlaylistPayload,
  stripMoodMetadata,
  trackUrlsToItems,
  withMoodMetadata,
} from './music.utils';
import type { Playlist } from './music.types';

describe('music.utils', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(754)).toBe('12:34');
  });

  it('returns stable gradient for same seed', () => {
    const first = getPlaylistGradient('Deep Focus');
    const second = getPlaylistGradient('Deep Focus');

    expect(first).toBe(second);
  });

  it('computes mood summary by track count', () => {
    const base: Omit<Playlist, 'urls'> = {
      id: '1',
      name: 'Session',
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    expect(getPlaylistMood({ ...base, urls: [] })).toContain('Silence curated');
    expect(getPlaylistMood({ ...base, urls: ['a', 'b'] })).toContain('Short reset');
    expect(getPlaylistMood({ ...base, urls: ['a', 'b', 'c', 'd'] })).toContain('Balanced focus');
    expect(getPlaylistMood({ ...base, urls: new Array(9).fill('x') })).toContain('Long-form flow');
  });

  it('extracts youtube artwork when available', () => {
    expect(getPlaylistArtwork(['https://youtu.be/dQw4w9WgXcQ'], 'seed')).toContain(
      'i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    );
    expect(getPlaylistArtwork(['https://example.com/audio.mp3'], 'seed')).toBeNull();
  });

  it('handles mood metadata helpers', () => {
    expect(extractPlaylistMood('[mood:focus] coding playlist')).toBe('focus');
    expect(extractPlaylistMood('no tag')).toBeNull();

    expect(stripMoodMetadata('[mood:night] wind down')).toBe('wind down');
    expect(stripMoodMetadata(undefined)).toBeUndefined();

    expect(withMoodMetadata('Flow state', 'calm')).toBe('[mood:calm] Flow state');
    expect(withMoodMetadata('[mood:focus] already tagged', undefined)).toBe('already tagged');
  });

  it('derives playlist mood category from tag or text', () => {
    expect(getPlaylistMoodCategory({ name: 'Anything', description: '[mood:night] reset' })).toBe('night');
    expect(getPlaylistMoodCategory({ name: 'Deep work sprint', description: undefined })).toBe('focus');
    expect(getPlaylistMoodCategory({ name: 'Morning breeze', description: 'soft piano' })).toBe('calm');
  });

  it('maps urls into playable track items and computes total duration', () => {
    const items = trackUrlsToItems([
      'https://www.youtube.com/watch?v=abcdEFGH123',
      '/audio/focus-track.mp3',
      'https://example.com/lofi-session',
      '   ',
    ]);

    expect(items).toHaveLength(3);
    expect(items[0]?.source).toBe('youtube');
    expect(items[1]?.source).toBe('local');
    expect(items[2]?.source).toBe('link');
    expect(items[0]?.coverImage).toContain('i.ytimg.com/vi/abcdEFGH123');

    const totalDuration = getPlaylistDuration(items);
    expect(totalDuration).toBeGreaterThan(0);
  });

  it('sanitizes playlist payload and strips empty urls', () => {
    const payload = sanitizePlaylistPayload({
      name: '  Focus Lane  ',
      description: '  Keep coding  ',
      mood: 'focus',
      urls: [' https://example.com/a ', ' ', 'https://example.com/b'],
    });

    expect(payload).toEqual({
      name: 'Focus Lane',
      description: '[mood:focus] Keep coding',
      urls: ['https://example.com/a', 'https://example.com/b'],
    });
  });
});
