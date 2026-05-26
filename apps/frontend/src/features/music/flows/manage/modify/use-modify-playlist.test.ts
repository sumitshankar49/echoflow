import { describe, expect, it, vi } from 'vitest';

import { useUpdatePlaylist } from './use-modify-playlist';
import { musicQueryKeys } from '../../../shared/data/music.query-keys';

const useMutationMock = vi.fn();
const invalidateQueriesMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useMutation: (...args: any[]) => useMutationMock(...args),
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

describe('useUpdatePlaylist', () => {
  it('invalidates list and detail keys on success', () => {
    useMutationMock.mockImplementation((config) => config);

    useUpdatePlaylist('playlist-1');
    const config = useMutationMock.mock.calls[0][0];

    config.onSuccess();

    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: musicQueryKeys.playlists() });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: musicQueryKeys.playlist('playlist-1') });
  });
});
