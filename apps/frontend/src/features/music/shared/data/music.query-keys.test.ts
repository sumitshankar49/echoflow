import { describe, expect, it } from 'vitest';

import { musicQueryKeys } from './music.query-keys';

describe('musicQueryKeys', () => {
  it('builds playlist list key', () => {
    expect(musicQueryKeys.all).toEqual(['music']);
    expect(musicQueryKeys.playlists()).toEqual(['music', 'playlists']);
  });

  it('builds playlist detail key', () => {
    expect(musicQueryKeys.playlist('playlist-1')).toEqual(['music', 'playlist', 'playlist-1']);
  });
});
