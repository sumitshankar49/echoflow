'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Clock3,
  Headphones,
  Heart,
  HeartPulse,
  Loader2,
  Music2,
  Play,
  Sparkles,
  Trash2,
  Waves,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ShimmerCard } from '@/components/common/ShimmerCard';
import { ConfirmActionDialog } from '@/components/common/confirm-action-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreatePlaylistForm } from '../../manage/create/create-playlist-form';
import { useRemovePlaylist } from '../../manage/remove/use-remove-playlist';
import { usePlaylistList } from './use-playlist-list';
import {
  formatTime,
  getPlaylistMoodCategory,
  getPlaylistArtwork,
  moodSuggestions,
  getPlaylistDuration,
  getPlaylistGradient,
  getPlaylistMood,
  stripMoodMetadata,
  trackUrlsToItems,
  type PlaylistMood,
} from '../../../shared/domain/music.utils';
import { FocusFlowMiniPlayer } from '../../../shared/ui/focusflow-mini-player';
import { resolveTrackMetadata } from '../../../shared/ui/use-track-metadata';
import { useFocusFlowPlayer } from '../../../shared/ui/use-focusflow-player';

export function PlaylistListView() {
  const { data: playlists, isPending, isFetching, isError } = usePlaylistList();
  const { mutateAsync: removePlaylist, isPending: isRemovingPlaylist } = useRemovePlaylist();
  const [showEntryLoader, setShowEntryLoader] = useState(true);
  const [featuredPlaylistId, setFeaturedPlaylistId] = useState<string | null>(null);
  const [playbackPlaylistId, setPlaybackPlaylistId] = useState<string | null>(null);
  const [pendingPlaybackIndex, setPendingPlaybackIndex] = useState<number | null>(null);
  const [favoritePlaylistIds, setFavoritePlaylistIds] = useState<string[]>([]);
  const [activeCollection, setActiveCollection] = useState<'all' | 'favorites'>('all');
  const [activeMoodFilter, setActiveMoodFilter] = useState<'all' | PlaylistMood>('all');
  const [showAllPlaylists, setShowAllPlaylists] = useState(false);
  const [activeDeletingPlaylistId, setActiveDeletingPlaylistId] = useState<string | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [playlistArtworkMap, setPlaylistArtworkMap] = useState<Record<string, string>>({});
  const playlistItems = Array.isArray(playlists) ? playlists : [];
  const favoritePlaylists = playlistItems.filter((playlist) => favoritePlaylistIds.includes(playlist.id));
  const collectionPlaylists = activeCollection === 'favorites' ? favoritePlaylists : playlistItems;
  const moodFilteredPlaylists =
    activeMoodFilter === 'all'
      ? collectionPlaylists
      : collectionPlaylists.filter((playlist) => getPlaylistMoodCategory(playlist) === activeMoodFilter);
  const hasMoreThanSixPlaylists = moodFilteredPlaylists.length > 6;
  const visiblePlaylists = showAllPlaylists ? moodFilteredPlaylists : moodFilteredPlaylists.slice(0, 6);

  const featuredPlaylist =
    playlistItems.find((playlist) => playlist.id === featuredPlaylistId) ?? playlistItems[0] ?? null;
  const playbackPlaylist =
    playlistItems.find((playlist) => playlist.id === playbackPlaylistId)
    ?? featuredPlaylist
    ?? playlistItems[0]
    ?? null;
  const playbackTracks = playbackPlaylist ? trackUrlsToItems(playbackPlaylist.urls) : [];
  const featuredTracks = featuredPlaylist ? trackUrlsToItems(featuredPlaylist.urls) : [];
  const player = useFocusFlowPlayer(playbackTracks);
  const dynamicTrackGradient = player.activeTrack?.gradientClassName || 'from-cyan-500/12 via-transparent to-emerald-400/10';

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowEntryLoader(false);
    }, 450);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const saved = localStorage.getItem('music_favorite_playlists');
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as string[];
      if (Array.isArray(parsed)) {
        setFavoritePlaylistIds(parsed);
      }
    } catch {
      // Ignore invalid local data.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem('music_favorite_playlists', JSON.stringify(favoritePlaylistIds));
  }, [favoritePlaylistIds]);

  useEffect(() => {
    if (!playlistItems.length) {
      setFeaturedPlaylistId(null);
      setPlaybackPlaylistId(null);
      return;
    }

    setFeaturedPlaylistId((current) => {
      if (!current) {
        return playlistItems[0].id;
      }

      const stillExists = playlistItems.some((playlist) => playlist.id === current);
      return stillExists ? current : playlistItems[0].id;
    });

    setPlaybackPlaylistId((current) => {
      if (!current) {
        return playlistItems[0].id;
      }

      const stillExists = playlistItems.some((playlist) => playlist.id === current);
      return stillExists ? current : playlistItems[0].id;
    });
  }, [playlistItems]);

  useEffect(() => {
    if (!playlistItems.length && activeCollection === 'favorites') {
      setActiveCollection('all');
      return;
    }

    const validIds = new Set(playlistItems.map((playlist) => playlist.id));
    setFavoritePlaylistIds((current) => current.filter((id) => validIds.has(id)));
  }, [activeCollection, playlistItems]);

  useEffect(() => {
    if (pendingPlaybackIndex === null) {
      return;
    }

    if (!playbackTracks[pendingPlaybackIndex]) {
      setPendingPlaybackIndex(null);
      return;
    }

    player.playTrack(pendingPlaybackIndex);
    setPendingPlaybackIndex(null);
  }, [pendingPlaybackIndex, playbackTracks, player]);

  useEffect(() => {
    if (!hasMoreThanSixPlaylists && showAllPlaylists) {
      setShowAllPlaylists(false);
    }
  }, [hasMoreThanSixPlaylists, showAllPlaylists]);

  useEffect(() => {
    setShowAllPlaylists(false);
  }, [activeCollection, activeMoodFilter]);

  useEffect(() => {
    let cancelled = false;

    const loadArtwork = async () => {
      const targets = playlistItems.filter((playlist) => {
        if (playlistArtworkMap[playlist.id]) {
          return false;
        }

        const firstUrl = playlist.urls.find(Boolean);
        if (!firstUrl) {
          return false;
        }

        return !getPlaylistArtwork([firstUrl], playlist.name);
      });

      if (!targets.length) {
        return;
      }

      const entries = await Promise.all(
        targets.map(async (playlist) => {
          const firstUrl = playlist.urls.find(Boolean);
          if (!firstUrl) {
            return [playlist.id, ''] as const;
          }

          const metadata = await resolveTrackMetadata(firstUrl);
          return [playlist.id, metadata?.thumbnailUrl || ''] as const;
        }),
      );

      if (cancelled) {
        return;
      }

      const nextMap: Record<string, string> = {};
      entries.forEach(([id, image]) => {
        if (image) {
          nextMap[id] = image;
        }
      });

      if (Object.keys(nextMap).length > 0) {
        setPlaylistArtworkMap((current) => ({ ...current, ...nextMap }));
      }
    };

    void loadArtwork();

    return () => {
      cancelled = true;
    };
  }, [playlistArtworkMap, playlistItems]);

  const showLoading = showEntryLoader || isPending || (isFetching && playlistItems.length === 0);
  const featuredCoverImage = featuredPlaylist
    ? playlistArtworkMap[featuredPlaylist.id] || getPlaylistArtwork(featuredPlaylist.urls, featuredPlaylist.name)
    : null;

  const toggleFavorite = (playlistId: string) => {
    setFavoritePlaylistIds((current) => {
      if (current.includes(playlistId)) {
        return current.filter((id) => id !== playlistId);
      }

      return [...current, playlistId];
    });
  };

  const handleRemovePlaylist = async (playlistId: string) => {
    try {
      setActiveDeletingPlaylistId(playlistId);
      await removePlaylist(playlistId);
      toast.success('Playlist removed');
    } catch {
      toast.error('Unable to remove playlist');
    } finally {
      setActiveDeletingPlaylistId(null);
    }
  };

  const handleRemoveAllPlaylists = async () => {
    if (!playlistItems.length) {
      return;
    }

    const ids = playlistItems.map((playlist) => playlist.id);
    setActiveDeletingPlaylistId('__bulk__');

    try {
      for (const id of ids) {
        await removePlaylist(id);
      }
      toast.success('All playlists removed');
    } catch {
      toast.error('Unable to remove all playlists');
    } finally {
      setActiveDeletingPlaylistId(null);
      setIsBulkDeleteDialogOpen(false);
    }
  };

  if (showLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={index}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.08 }}
            >
              <ShimmerCard lineCount={5} delay={index * 0.05} className="h-[270px]" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-500">Failed to load playlists.</p>;
  }

  return (
    <div className="relative w-full space-y-8 overflow-x-clip pb-36">
      <div className="absolute inset-x-0 top-0 -z-10 h-[26rem] rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(12,74,110,0.88),rgba(4,120,87,0.78))]" />
      <motion.div
        key={dynamicTrackGradient}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          'pointer-events-none absolute inset-x-8 top-[8.2rem] -z-10 h-52 rounded-[2.2rem] bg-gradient-to-r blur-3xl',
          dynamicTrackGradient,
        )}
      />

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 text-white shadow-[0_25px_80px_-45px_rgba(2,132,199,0.75)] backdrop-blur-xl sm:p-8">
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
              <motion.blockquote
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                className="max-w-2xl rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm italic text-cyan-100/80"
              >
                "Good music can quiet the noise in your mind and let deep work breathe."
              </motion.blockquote>
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
                  {featuredCoverImage ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-90"
                      style={{ backgroundImage: `url(${featuredCoverImage})` }}
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
                    <h2 className="mt-2 line-clamp-2 text-3xl font-semibold tracking-tight">{featuredPlaylist.name}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
                      {stripMoodMetadata(featuredPlaylist.description) || getPlaylistMood(featuredPlaylist)}
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
                      onClick={() => {
                        if (!featuredPlaylist || !featuredTracks.length) {
                          return;
                        }

                        setPlaybackPlaylistId(featuredPlaylist.id);
                        setPendingPlaybackIndex(0);
                      }}
                      disabled={!featuredTracks.length}
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Start flow
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => {
                        if (typeof window === 'undefined') {
                          return;
                        }

                        const section = document.getElementById('focusflow-create-playlist');
                        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      Create New Playlist
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

        <div id="focusflow-create-playlist">
          <CreatePlaylistForm className="xl:sticky xl:top-6" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {moodSuggestions.map((suggestion, index) => {
          const isActive = activeMoodFilter === suggestion.value;

          return (
          <motion.article
            key={suggestion.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className={cn(
              'cursor-pointer rounded-2xl border bg-card/70 p-4 shadow-sm transition hover:border-cyan-300/45 hover:shadow-md',
              isActive ? 'border-cyan-400/45 ring-1 ring-cyan-300/25' : 'border-border/70',
            )}
            onClick={() => {
              setActiveMoodFilter((current) => (current === suggestion.value ? 'all' : suggestion.value));
            }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Mood suggestion</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">{suggestion.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{suggestion.note}</p>
            <p className="mt-2 text-xs text-cyan-600/80">
              {isActive ? 'Active filter · click to clear' : 'Click to show matching playlists'}
            </p>
          </motion.article>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Curated playlists</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Album-art cards with calm motion</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 p-1 shadow-sm backdrop-blur">
              <Button
                type="button"
                size="sm"
                variant={activeCollection === 'all' ? 'default' : 'ghost'}
                className="rounded-full"
                onClick={() => setActiveCollection('all')}
              >
                All
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activeCollection === 'favorites' ? 'default' : 'ghost'}
                className="rounded-full"
                onClick={() => setActiveCollection('favorites')}
              >
                <motion.span
                  animate={activeCollection === 'favorites' ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.45 }}
                  className="mr-1.5 inline-flex"
                >
                  <HeartPulse className="h-3.5 w-3.5" />
                </motion.span>
                Favorites ({favoritePlaylists.length})
              </Button>
            </div>
            {hasMoreThanSixPlaylists ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setShowAllPlaylists((value) => !value)}
              >
                {showAllPlaylists ? 'Show first 6' : `Show all (${playlistItems.length})`}
              </Button>
            ) : null}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <Headphones className="h-4 w-4 text-cyan-500" />
              Hover a card to feature it in the player
            </div>
            {activeMoodFilter !== 'all' ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setActiveMoodFilter('all')}
              >
                Clear mood filter
              </Button>
            ) : null}
            {playlistItems.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-600"
                onClick={() => {
                  setIsBulkDeleteDialogOpen(true);
                }}
                disabled={isRemovingPlaylist || activeDeletingPlaylistId === '__bulk__'}
              >
                {activeDeletingPlaylistId === '__bulk__' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Remove all playlists
              </Button>
            ) : null}
          </div>
        </div>

        {moodFilteredPlaylists.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border/80 bg-background/70 p-10 text-center shadow-sm backdrop-blur">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600">
              <Music2 className="h-6 w-6" />
            </div>
            <p className="text-lg font-medium">
              {activeMoodFilter !== 'all'
                ? 'No playlists for this mood yet'
                : activeCollection === 'favorites'
                  ? 'No favorites yet'
                  : 'No playlists yet'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeMoodFilter !== 'all'
                ? 'Create a playlist with this mood suggestion to see it here.'
                : activeCollection === 'favorites'
                ? 'Tap the heart icon on any playlist to save it in favorites.'
                : 'Create one above and start building a more relaxing listening routine.'}
            </p>
            {activeCollection === 'all' ? (
              <Button
                type="button"
                className="mt-4 rounded-full"
                onClick={() => {
                  if (typeof window === 'undefined') {
                    return;
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Create your first playlist
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid justify-items-center gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visiblePlaylists.map((playlist) => {
              const tracks = trackUrlsToItems(playlist.urls);
              const coverImage = playlistArtworkMap[playlist.id] || getPlaylistArtwork(playlist.urls, playlist.name);
              const isFeatured = featuredPlaylist?.id === playlist.id;
              const isFavorite = favoritePlaylistIds.includes(playlist.id);

              return (
                <motion.article
                  key={playlist.id}
                  className={cn(
                    'group relative w-full max-w-[350px] overflow-hidden rounded-[1.4rem] border bg-card/80 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_42px_-26px_rgba(14,165,233,0.35)]',
                    isFeatured ? 'border-cyan-400/40 ring-1 ring-cyan-300/25' : 'border-border/70',
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.28 }}
                  onMouseEnter={() => {
                    if (player.isPlaying) {
                      return;
                    }

                    setFeaturedPlaylistId(playlist.id);
                  }}
                >
                  <div className={cn('relative aspect-[1.18] overflow-hidden bg-gradient-to-br', getPlaylistGradient(playlist.name))}>
                    {coverImage ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${coverImage})` }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-950/75" />
                    <button
                      type="button"
                      className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/90 backdrop-blur transition hover:bg-black/35"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavorite(playlist.id);
                      }}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={cn('h-4 w-4', isFavorite ? 'fill-rose-400 text-rose-400' : '')} />
                    </button>
                    <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">
                      {tracks.length} tracks
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">FocusFlow</p>
                        <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-tight text-white">{playlist.name}</h3>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white opacity-100 transition duration-300 hover:scale-105 hover:bg-white/25"
                        onClick={() => {
                          setFeaturedPlaylistId(playlist.id);
                          setPlaybackPlaylistId(playlist.id);
                          setPendingPlaybackIndex(0);
                        }}
                      >
                        <Play className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 p-3.5 sm:p-4">
                    <div>
                      <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                        {stripMoodMetadata(playlist.description) || getPlaylistMood(playlist)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {tracks.slice(0, 2).map((track) => (
                        <span key={track.id} className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
                          {track.sourceLabel}
                        </span>
                      ))}
                      {tracks.length > 2 ? (
                        <span className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
                          +{tracks.length - 2} more
                        </span>
                      ) : null}
                      {!tracks.length ? (
                        <span className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1">Empty shell</span>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between border-t border-border/60 pt-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estimated run</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{formatTime(getPlaylistDuration(tracks))}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-rose-600 hover:bg-rose-500/10 hover:text-rose-600"
                          title="Remove playlist"
                          onClick={() => {
                            setPlaylistToDelete({ id: playlist.id, name: playlist.name });
                          }}
                          disabled={isRemovingPlaylist}
                        >
                          {activeDeletingPlaylistId === playlist.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Link
                          href={`/music/${playlist.id}`}
                          className={cn(buttonVariants({ variant: 'ghost' }), 'h-9 rounded-full px-3')}
                        >
                          Open playlist
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {hasMoreThanSixPlaylists ? (
          <div className="flex justify-center pt-1">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => setShowAllPlaylists((value) => !value)}
            >
              {showAllPlaylists ? 'Show first 6 playlists' : `Show ${playlistItems.length - 6} more playlists`}
            </Button>
          </div>
        ) : null}
      </section>

      {featuredPlaylist ? (
        <FocusFlowMiniPlayer
          playlistName={playbackPlaylist?.name ?? featuredPlaylist.name}
          track={player.activeTrack ?? playbackTracks[0] ?? null}
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
      ) : null}

      <ConfirmActionDialog
        open={Boolean(playlistToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPlaylistToDelete(null);
          }
        }}
        title="Delete playlist"
        description={
          playlistToDelete
            ? `Are you sure you want to delete \"${playlistToDelete.name}\"? This action cannot be undone.`
            : 'Are you sure you want to delete this playlist?'
        }
        confirmLabel="Delete playlist"
        isLoading={isRemovingPlaylist && activeDeletingPlaylistId !== '__bulk__'}
        onConfirm={async () => {
          if (!playlistToDelete) {
            return;
          }

          const target = playlistToDelete;
          setPlaylistToDelete(null);
          await handleRemovePlaylist(target.id);
        }}
      />

      <ConfirmActionDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        title="Delete all playlists"
        description={`Are you sure you want to delete all ${playlistItems.length} playlists? This action cannot be undone.`}
        confirmLabel="Delete all"
        isLoading={activeDeletingPlaylistId === '__bulk__'}
        onConfirm={handleRemoveAllPlaylists}
      />
    </div>
  );
}
