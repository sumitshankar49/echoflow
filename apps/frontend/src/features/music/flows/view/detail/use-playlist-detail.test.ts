import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePlaylistDetail } from './use-playlist-detail';
import { musicQueryKeys } from '../../../shared/data/music.query-keys';

const useQueryMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => useQueryMock(...args),
}));

describe('usePlaylistDetail', () => {
  beforeEach(() => {
    useQueryMock.mockReset();
  });

  it('enables query when id is present', () => {
    useQueryMock.mockReturnValue({ data: null });

    usePlaylistDetail('playlist-1');

    const config = useQueryMock.mock.calls[0][0];
    expect(config.queryKey).toEqual(musicQueryKeys.playlist('playlist-1'));
    expect(config.enabled).toBe(true);
  });

  it('disables query when id is empty', () => {
    useQueryMock.mockReturnValue({ data: null });

    usePlaylistDetail('');

    const config = useQueryMock.mock.calls[0][0];
    expect(config.enabled).toBe(false);
  });
});
