'use client';

import { usePlaylistDetail } from './use-playlist-detail';

export function PlaylistDetailView({ id }: { id: string }) {
  const { data: playlist, isPending, isError } = usePlaylistDetail(id);

  if (isPending) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (isError) return <p className="text-sm text-red-500">Playlist not found.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{playlist.name}</h1>
      {playlist.description && (
        <p className="text-sm text-muted-foreground">{playlist.description}</p>
      )}
      <ul className="space-y-2">
        {playlist.urls.map((url, i) => (
          <li key={i} className="rounded-lg border px-4 py-2 text-sm">
            <a href={url} target="_blank" rel="noreferrer" className="underline">
              {url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
