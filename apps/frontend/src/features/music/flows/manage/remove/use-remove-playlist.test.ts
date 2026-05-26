import { describe, expect, it, vi } from 'vitest';

import { useRemovePlaylist } from './use-remove-playlist';
import { musicQueryKeys } from '../../../shared/data/music.query-keys';

const useMutationMock = vi.fn();
const invalidateQueriesMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useMutation: (...args: any[]) => useMutationMock(...args),
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

describe('useRemovePlaylist', () => {
  it('invalidates list and removed playlist detail keys on success', () => {
    useMutationMock.mockImplementation((config) => config);

    useRemovePlaylist();
    const config = useMutationMock.mock.calls[0][0];

    config.onSuccess({}, 'playlist-1');

    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: musicQueryKeys.playlists() });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: musicQueryKeys.playlist('playlist-1') });
  });
});
