import { describe, expect, it, vi } from 'vitest';

import { usePlaylistList } from './use-playlist-list';
import { musicService } from '../../../shared/data/music.service';
import { musicQueryKeys } from '../../../shared/data/music.query-keys';

const useQueryMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => useQueryMock(...args),
}));

describe('usePlaylistList', () => {
  it('wires query key and query function', () => {
    useQueryMock.mockReturnValue({ data: [] });

    usePlaylistList();

    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: musicQueryKeys.playlists(),
      queryFn: musicService.list,
    });
  });
});
