'use client';

import { usePlaylistList } from './use-playlist-list';

export function PlaylistListView() {
  const { data: playlists, isPending, isError } = usePlaylistList();

  if (isPending) return <p className="text-sm text-muted-foreground">Loading playlists…</p>;
  if (isError) return <p className="text-sm text-red-500">Failed to load playlists.</p>;

  return (
    <ul className="space-y-3">
      {playlists.map((playlist) => (
        <li key={playlist.id} className="rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold">{playlist.name}</h3>
          {playlist.description && (
            <p className="mt-1 text-sm text-muted-foreground">{playlist.description}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">{playlist.urls.length} tracks</p>
        </li>
      ))}
    </ul>
  );
}
