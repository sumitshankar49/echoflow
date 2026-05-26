import { describe, expect, it, vi } from 'vitest';

import { useCreatePlaylist } from './use-create-playlist';
import { musicService } from '../../../shared/data/music.service';
import { musicQueryKeys } from '../../../shared/data/music.query-keys';

const useMutationMock = vi.fn();
const invalidateQueriesMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useMutation: (...args: any[]) => useMutationMock(...args),
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

describe('useCreatePlaylist', () => {
  it('invalidates playlist list on success', () => {
    useMutationMock.mockImplementation((config) => config);

    useCreatePlaylist();
    const config = useMutationMock.mock.calls[0][0];

    expect(config.mutationFn).toBe(musicService.create);
    config.onSuccess();
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: musicQueryKeys.playlists() });
  });
});
