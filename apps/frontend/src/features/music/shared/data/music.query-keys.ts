export const musicQueryKeys = {
  all: ['music'] as const,
  playlists: () => [...musicQueryKeys.all, 'playlists'] as const,
  playlist: (id: string) => [...musicQueryKeys.all, 'playlist', id] as const,
};
