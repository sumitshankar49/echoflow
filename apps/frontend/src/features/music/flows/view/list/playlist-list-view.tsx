'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Clock3, Headphones, Music2, Play, Sparkles, Waves } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreatePlaylistForm } from '../../manage/create/create-playlist-form';
import { usePlaylistList } from './use-playlist-list';
import {
  formatTime,
  getPlaylistArtwork,
  getPlaylistDuration,
  getPlaylistGradient,
  getPlaylistMood,
  trackUrlsToItems,
} from '../../../shared/domain/music.utils';
import { FocusFlowMiniPlayer } from '../../../shared/ui/focusflow-mini-player';
import { useFocusFlowPlayer } from '../../../shared/ui/use-focusflow-player';

export function PlaylistListView() {
  const { data: playlists, isPending, isError } = usePlaylistList();
  const [featuredPlaylistId, setFeaturedPlaylistId] = useState<string | null>(null);
  const playlistItems = Array.isArray(playlists) ? playlists : [];

  const featuredPlaylist =
    playlistItems.find((playlist) => playlist.id === featuredPlaylistId) ?? playlistItems[0] ?? null;
  const featuredTracks = featuredPlaylist ? trackUrlsToItems(featuredPlaylist.urls) : [];
  const player = useFocusFlowPlayer(featuredTracks);

  useEffect(() => {
    if (!playlistItems.length) {
      setFeaturedPlaylistId(null);
      return;
    }

    setFeaturedPlaylistId((current) => current ?? playlistItems[0].id);
  }, [playlistItems]);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading playlists…</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-500">Failed to load playlists.</p>;
  }

  return (
    <div className="relative mx-auto w-full max-w-[1400px] space-y-8 overflow-x-clip pb-36">
      <div className="absolute inset-x-0 top-0 -z-10 h-[26rem] rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(12,74,110,0.88),rgba(4,120,87,0.78))]" />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 text-white shadow-[0_25px_80px_-45px_rgba(2,132,199,0.75)] backdrop-blur-xl sm:p-8">
          <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" />

          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs uppercase tracking-[0.34em] text-cyan-100/80">
              <Sparkles className="h-3.5 w-3.5" />
              FocusFlow Music
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl 2xl:text-5xl">
                Premium playlists crafted for focus, flow, and a peaceful atmosphere. 
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                Build elegant listening lanes, store YouTube or local tracks, and keep a soft playback ritual pinned at the bottom while you work.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Playlists</p>
                <p className="mt-2 text-3xl font-semibold">{playlistItems.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Tracks saved</p>
                <p className="mt-2 text-3xl font-semibold">{playlistItems.reduce((total, playlist) => total + playlist.urls.length, 0)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Mood</p>
                <p className="mt-2 text-xl font-semibold">Relaxed and premium</p>
              </div>
            </div>

            {featuredPlaylist ? (
              <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                <div className={cn('relative aspect-square overflow-hidden rounded-[1.6rem] bg-gradient-to-br', getPlaylistGradient(featuredPlaylist.name))}>
                  {getPlaylistArtwork(featuredPlaylist.urls, featuredPlaylist.name) ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-90"
                      style={{ backgroundImage: `url(${getPlaylistArtwork(featuredPlaylist.urls, featuredPlaylist.name)})` }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/40" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-black/25 p-3 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.26em] text-white/55">Featured lane</p>
                    <p className="mt-2 text-xl font-semibold">{featuredPlaylist.name}</p>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/65">Current highlight</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight">{featuredPlaylist.name}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
                      {featuredPlaylist.description || getPlaylistMood(featuredPlaylist)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-white/72">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                      <Music2 className="h-4 w-4 text-cyan-200" />
                      {featuredPlaylist.urls.length} tracks
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                      <Clock3 className="h-4 w-4 text-emerald-200" />
                      {formatTime(getPlaylistDuration(featuredTracks))} estimated
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                      <Waves className="h-4 w-4 text-sky-200" />
                      Smooth drift mode
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      className="rounded-full bg-white px-5 text-slate-950 hover:bg-cyan-50"
                      onClick={() => player.playTrack(0)}
                      disabled={!featuredTracks.length}
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Start flow
                    </Button>
                    <Link
                      href={`/music/${featuredPlaylist.id}`}
                      className={cn(
                        buttonVariants({ variant: 'outline' }),
                        'rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10',
                      )}
                    >
                      Open details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <CreatePlaylistForm className="self-start" />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Curated playlists</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Album-art cards with calm motion</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
            <Headphones className="h-4 w-4 text-cyan-500" />
            Hover a card to feature it in the player
          </div>
        </div>

        {playlistItems.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border/80 bg-background/70 p-10 text-center shadow-sm backdrop-blur">
            <p className="text-lg font-medium">No playlists yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Create one above and start building a more relaxing listening routine.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {playlistItems.map((playlist) => {
              const tracks = trackUrlsToItems(playlist.urls);
              const coverImage = getPlaylistArtwork(playlist.urls, playlist.name);
              const isFeatured = featuredPlaylist?.id === playlist.id;

              return (
                <article
                  key={playlist.id}
                  className={cn(
                    'group relative overflow-hidden rounded-[2rem] border bg-card/70 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-34px_rgba(14,165,233,0.45)]',
                    isFeatured ? 'border-cyan-400/40 ring-1 ring-cyan-300/25' : 'border-border/70',
                  )}
                  onMouseEnter={() => setFeaturedPlaylistId(playlist.id)}
                >
                  <div className={cn('relative aspect-[1.08] overflow-hidden bg-gradient-to-br', getPlaylistGradient(playlist.name))}>
                    {coverImage ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${coverImage})` }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-950/75" />
                    <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">
                      {tracks.length} tracks
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/60">FocusFlow</p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">{playlist.name}</h3>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white opacity-0 transition duration-300 hover:scale-105 hover:bg-white/20 group-hover:opacity-100"
                        onClick={() => {
                          setFeaturedPlaylistId(playlist.id);
                          player.playTrack(0);
                        }}
                      >
                        <Play className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div>
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {playlist.description || getPlaylistMood(playlist)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {tracks.slice(0, 3).map((track) => (
                        <span key={track.id} className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
                          {track.sourceLabel}
                        </span>
                      ))}
                      {!tracks.length ? (
                        <span className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1">Empty shell</span>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estimated run</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{formatTime(getPlaylistDuration(tracks))}</p>
                      </div>
                      <Link
                        href={`/music/${playlist.id}`}
                        className={cn(buttonVariants({ variant: 'ghost' }), 'rounded-full')}
                      >
                        Open playlist
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {featuredPlaylist ? (
        <FocusFlowMiniPlayer
          playlistName={featuredPlaylist.name}
          track={player.activeTrack ?? featuredTracks[0] ?? null}
          isPlaying={player.isPlaying}
          progress={player.progress}
          elapsedSeconds={player.elapsedSeconds}
          onTogglePlayback={player.togglePlayback}
          onPreviousTrack={player.previousTrack}
          onNextTrack={player.nextTrack}
        />
      ) : null}
    </div>
  );
}
