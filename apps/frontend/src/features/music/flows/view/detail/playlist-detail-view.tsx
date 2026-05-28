'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  MoreHorizontal,
  Music2,
  Pencil,
  Play,
  Sparkles,
  Waves,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUpdatePlaylist } from '../../manage/modify/use-modify-playlist';
import { usePlaylistDetail } from './use-playlist-detail';
import {
  formatTime,
  getPlaylistArtwork,
  getPlaylistDuration,
  getPlaylistGradient,
  getPlaylistMood,
  stripMoodMetadata,
  trackUrlsToItems,
} from '../../../shared/domain/music.utils';
import { FocusFlowMiniPlayer } from '../../../shared/ui/focusflow-mini-player';
import { PlaylistEditorForm } from '../../../shared/ui/playlist-editor-form';
import { ShimmerCard } from '@/components/common/ShimmerCard';
import { useFocusFlowPlayer } from '../../../shared/ui/use-focusflow-player';
import { useTrackMetadata } from '../../../shared/ui/use-track-metadata';

function TrackMetaLine({ trackTitle, fallbackSubtitle, url }: { trackTitle: string; fallbackSubtitle: string; url: string }) {
  const metadata = useTrackMetadata(url);
  const displayTitle = metadata?.title || trackTitle;
  const displaySubtitle = metadata?.artist || fallbackSubtitle;

  return (
    <>
      <h4 className="truncate text-lg font-semibold">{displayTitle}</h4>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{displaySubtitle}</p>
    </>
  );
}

export function PlaylistDetailView({ id }: { id: string }) {
  const { data: playlist, isPending, isError } = usePlaylistDetail(id);
  const { mutateAsync, isPending: isSaving } = useUpdatePlaylist(id);
  const [isEditing, setIsEditing] = useState(false);
  const tracks = playlist ? trackUrlsToItems(playlist.urls) : [];
  const firstTrackMetadata = useTrackMetadata(playlist?.urls?.[0] ?? null);
  const headerCoverImage = firstTrackMetadata?.thumbnailUrl || (playlist ? getPlaylistArtwork(playlist.urls, playlist.name) : null);
  const player = useFocusFlowPlayer(tracks);

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ShimmerCard key={index} lineCount={4} showAvatar delay={index * 0.06} className="h-[220px]" />
        ))}
      </div>
    );
  }

  if (isError || !playlist) {
    return <p className="text-sm text-red-500">Playlist not found.</p>;
  }

  return (
    <div className="relative w-full space-y-8 overflow-x-clip pb-36">
      <div className="absolute inset-x-0 top-0 -z-10 h-[24rem] rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.18),transparent_24%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(12,74,110,0.82),rgba(6,95,70,0.72))]" />
      {headerCoverImage ? (
        <div
          className="pointer-events-none absolute inset-x-8 top-8 -z-10 h-64 rounded-[2.2rem] bg-cover bg-center opacity-20 blur-3xl"
          style={{ backgroundImage: `url(${headerCoverImage})` }}
        />
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 text-white shadow-[0_25px_80px_-42px_rgba(2,132,199,0.7)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/music"
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10',
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to playlists
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs uppercase tracking-[0.32em] text-cyan-100/80">
            <Sparkles className="h-3.5 w-3.5" />
            Premium detail view
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className={cn('relative aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-br shadow-[0_18px_50px_-25px_rgba(15,23,42,0.75)]', getPlaylistGradient(playlist.name))}>
            {headerCoverImage ? (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-90"
                style={{ backgroundImage: `url(${headerCoverImage})` }}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/65" />
            <div className="absolute bottom-5 left-5 right-5 rounded-[1.4rem] border border-white/15 bg-black/20 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.26em] text-white/55">FocusFlow Playlist</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{playlist.name}</h1>
              <p className="mt-2 text-sm text-white/70">{playlist.urls.length} tracks • {formatTime(getPlaylistDuration(tracks))}</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/65">Mood lane</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{playlist.name}</h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/68">
                {stripMoodMetadata(playlist.description) || getPlaylistMood(playlist)}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Tracks</p>
                <p className="mt-2 text-3xl font-semibold">{tracks.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Estimated length</p>
                <p className="mt-2 text-3xl font-semibold">{formatTime(getPlaylistDuration(tracks))}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Created</p>
                <p className="mt-2 text-lg font-semibold">{new Date(playlist.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="rounded-full bg-white px-5 text-slate-950 hover:bg-cyan-50"
                onClick={() => player.playTrack(0)}
                disabled={!tracks.length}
              >
                <Play className="h-4 w-4 fill-current" />
                Play focus set
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => setIsEditing((value) => !value)}
              >
                <Pencil className="h-4 w-4" />
                {isEditing ? 'Close editor' : 'Edit playlist'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {isEditing ? (
        <PlaylistEditorForm
          title="Refine this playlist"
          description="Adjust the playlist story, swap in calmer sources, or add another link to lengthen the session."
          submitLabel={isSaving ? 'Saving…' : 'Save changes'}
          isPending={isSaving}
          initialValues={{
            name: playlist.name,
            description: stripMoodMetadata(playlist.description),
            urls: playlist.urls.length ? playlist.urls : [''],
          }}
          onCancel={() => setIsEditing(false)}
          onSubmit={async (payload) => {
            try {
              await mutateAsync(payload);
              toast.success('Playlist updated');
              setIsEditing(false);
            } catch {
              toast.error('Unable to update playlist');
            }
          }}
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Track deck</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Relaxed, tactile song cards</h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <Waves className="h-4 w-4 text-cyan-500" />
              Select a track to shift the mini player
            </div>
          </div>

          {tracks.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-border/70 bg-background/70 p-10 text-center shadow-sm backdrop-blur">
              <p className="text-lg font-medium">No songs yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Open the editor and add a YouTube link or local audio path to start the set.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <motion.button
                  key={track.id}
                  type="button"
                  className={cn(
                    'group grid w-full gap-4 rounded-[1.6rem] border bg-card/75 p-4 text-left shadow-[0_18px_40px_-30px_rgba(15,23,42,0.38)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-[0_24px_55px_-32px_rgba(14,165,233,0.32)] sm:grid-cols-[92px_minmax(0,1fr)_auto]',
                    player.activeTrack?.id === track.id ? 'border-cyan-300/45 ring-1 ring-cyan-300/25' : 'border-border/70',
                  )}
                  whileHover={{ y: -2 }}
                  onClick={() => player.playTrack(index)}
                >
                  <div className={cn('relative aspect-square overflow-hidden rounded-[1.35rem] bg-gradient-to-br', track.gradientClassName)}>
                    {track.coverImage ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${track.coverImage})` }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/45" />
                    <div className="absolute bottom-2 right-2 rounded-full border border-white/15 bg-black/25 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/75 backdrop-blur">
                      {track.sourceLabel}
                    </div>
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur">
                        <Play className="h-4 w-4 fill-current" />
                      </span>
                    </motion.div>
                  </div>

                  <div className="min-w-0 self-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-cyan-500/10 px-2 text-xs font-medium text-cyan-600">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <TrackMetaLine
                          trackTitle={track.title}
                          fallbackSubtitle={track.subtitle}
                          url={track.url}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1">
                        {track.sourceLabel}
                      </span>
                      <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1">
                        {formatTime(track.durationSeconds)} simulated run
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3 sm:self-stretch">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatTime(track.durationSeconds)}
                    </div>
                    <button
                      type="button"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground hover:text-foreground"
                      title="Track options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm text-foreground transition hover:border-cyan-300/40 hover:text-cyan-600"
                    >
                      Open source
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-border/70 bg-card/75 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.38)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Listening summary</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-[1.3rem] border border-border/70 bg-background/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600">
                    <Music2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Curated sources</p>
                    <p className="text-sm text-muted-foreground">{tracks.filter((track) => track.source === 'youtube').length} YouTube, {tracks.filter((track) => track.source === 'local').length} local</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.3rem] border border-border/70 bg-background/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <Waves className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vibe profile</p>
                    <p className="text-sm text-muted-foreground">{getPlaylistMood(playlist)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <FocusFlowMiniPlayer
        playlistName={playlist.name}
        track={player.activeTrack ?? tracks[0] ?? null}
        isPlaying={player.isPlaying}
        elapsedSeconds={player.elapsedSeconds}
        durationSeconds={player.durationSeconds}
        onTogglePlayback={player.togglePlayback}
        onPreviousTrack={player.previousTrack}
        onNextTrack={player.nextTrack}
        onPlaybackStateChange={player.onPlaybackStateChange}
        onProgressChange={player.onProgressChange}
        onDurationChange={player.onDurationChange}
        onTrackEnded={player.onTrackEnded}
        onPlaybackError={player.onPlaybackError}
      />
    </div>
  );
}
