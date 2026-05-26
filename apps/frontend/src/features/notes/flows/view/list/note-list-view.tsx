'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Grid2X2,
  List,
  Pencil,
  Search,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ContentReveal } from '@/components/common/ContentReveal';
import { ConfirmActionDialog } from '@/components/common/confirm-action-dialog';
import { ShimmerCard } from '@/components/common/ShimmerCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoteEditor } from '@/features/notes/flows/manage/editor/note-editor';
import { notesQueryKeys } from '@/features/notes/shared/data/notes.query-keys';
import { notesService } from '@/features/notes/shared/data/notes.service';
import { useDebouncedValue } from '@/shared/utils/use-debounced-value';

const PAGE_SIZE = 8;

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function NoteListView() {
  const queryClient = useQueryClient();

  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [useInfiniteMode, setUseInfiniteMode] = useState(false);
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; title: string } | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const debouncedQuery = useDebouncedValue(query, 350);

  const { data: notes = [], isPending, isError } = useQuery({
    queryKey: notesQueryKeys.list(),
    queryFn: notesService.list,
  });

  const { data: searchResults = [], isPending: isSearchPending } = useQuery({
    queryKey: notesQueryKeys.search(debouncedQuery),
    queryFn: () => notesService.search(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });

  const createMutation = useMutation({
    mutationFn: notesService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notesQueryKeys.all });
      toast.success('Note created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { title: string; content: string; tags: string[] } }) =>
      notesService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notesQueryKeys.all });
      toast.success('Note updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notesService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notesQueryKeys.all });
      toast.success('Note deleted');
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      notesService.update(id, { isFavorite }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notesQueryKeys.all });
    },
    onError: () => toast.error('Could not update favorite status'),
  });

  const sourceNotes = debouncedQuery.trim().length > 0 ? searchResults : notes;

  const hydratedNotes = useMemo(() => sourceNotes, [sourceNotes]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    hydratedNotes.forEach((note) => {
      (note.tags ?? []).forEach((tag) => set.add(tag));
    });
    return ['all', ...Array.from(set)];
  }, [hydratedNotes]);

  const filteredNotes = useMemo(
    () =>
      hydratedNotes.filter((note) => {
        if (favoritesOnly && !note.favorite) {
          return false;
        }

        if (selectedTag !== 'all' && !(note.tags ?? []).includes(selectedTag)) {
          return false;
        }

        return !deletingIds.includes(note.id);
      }),
    [hydratedNotes, favoritesOnly, selectedTag, deletingIds],
  );

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / PAGE_SIZE));

  const visibleNotes = useMemo(() => {
    if (useInfiniteMode) {
      return filteredNotes.slice(0, visibleCount);
    }

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredNotes.slice(start, end);
  }, [filteredNotes, useInfiniteMode, visibleCount, page]);

  useEffect(() => {
    setPage(1);
    setVisibleCount(PAGE_SIZE);
  }, [debouncedQuery, favoritesOnly, selectedTag, useInfiniteMode]);

  useEffect(() => {
    if (!useInfiniteMode) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) {
          return;
        }

        setVisibleCount((current) => {
          if (current >= filteredNotes.length) {
            return current;
          }

          return Math.min(current + PAGE_SIZE, filteredNotes.length);
        });
      },
      {
        threshold: 0.3,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredNotes.length, useInfiniteMode]);

  const resetEditorState = () => {
    setIsEditorOpen(false);
    setEditingNoteId(null);
  };

  const editingNote = useMemo(
    () => (editingNoteId ? hydratedNotes.find((note) => note.id === editingNoteId) ?? null : null),
    [editingNoteId, hydratedNotes],
  );

  const handleFavoriteToggle = async (noteId: string, currentFavorite: boolean) => {
    await toggleFavoriteMutation.mutateAsync({
      id: noteId,
      isFavorite: !currentFavorite,
    });
  };

  const handleDelete = (noteId: string, noteTitle: string) => {
    setNoteToDelete({ id: noteId, title: noteTitle });
  };

  const confirmDelete = async () => {
    if (!noteToDelete) {
      return;
    }

    const noteId = noteToDelete.id;
    setDeletingIds((prev) => [...prev, noteId]);
    setNoteToDelete(null);

    window.setTimeout(async () => {
      try {
        await deleteMutation.mutateAsync(noteId);
      } catch {
        toast.error('Could not delete note');
      } finally {
        setDeletingIds((prev) => prev.filter((id) => id !== noteId));
      }
    }, 220);
  };

  const handleCreate = async (payload: { title: string; content: string; tags: string[] }) => {
    await createMutation.mutateAsync({
      title: payload.title,
      content: payload.content,
      tags: payload.tags,
      isFavorite: false,
    });

    resetEditorState();
  };

  const handleUpdate = async (payload: { title: string; content: string; tags: string[] }) => {
    if (!editingNoteId) {
      return;
    }

    await updateMutation.mutateAsync({
      id: editingNoteId,
      payload: {
        title: payload.title,
        content: payload.content,
        tags: payload.tags,
      },
    });

    resetEditorState();
  };

  if (isError) {
    return <p className="text-sm text-red-500">Failed to load notes.</p>;
  }

  return (
    <ContentReveal
      loading={isPending}
      loader={
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ShimmerCard key={index} lineCount={4} showAvatar delay={index * 0.05} />
            ))}
          </div>
        </div>
      }
    >
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border bg-background p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title or content..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={viewMode === 'grid' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-1"
            >
              <Grid2X2 className="h-4 w-4" /> Grid
            </Button>
            <Button
              type="button"
              variant={viewMode === 'list' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-1"
            >
              <List className="h-4 w-4" /> List
            </Button>
          </div>

          <Button type="button" onClick={() => setIsEditorOpen(true)} className="gap-2">
            <Sparkles className="h-4 w-4" /> New note
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={favoritesOnly ? 'default' : 'secondary'}
            onClick={() => setFavoritesOnly((v) => !v)}
            className="gap-1"
          >
            <Star className="h-4 w-4" /> Favorites
          </Button>

          {allTags.map((tag) => (
            <Button
              key={tag}
              type="button"
              size="sm"
              variant={selectedTag === tag ? 'default' : 'secondary'}
              onClick={() => setSelectedTag(tag)}
            >
              {tag === 'all' ? 'All tags' : `#${tag}`}
            </Button>
          ))}

          <Button
            type="button"
            size="sm"
            variant={useInfiniteMode ? 'default' : 'secondary'}
            onClick={() => setUseInfiniteMode((v) => !v)}
          >
            {useInfiniteMode ? 'Infinite scroll' : 'Pagination'}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isEditorOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/35 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className="mx-auto mt-10 w-full max-w-3xl rounded-2xl border bg-background p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{editingNote ? 'Edit Note' : 'Create Note'}</h2>
                <Badge variant="secondary">Rich text editor</Badge>
              </div>

              <NoteEditor
                initialTitle={editingNote?.title ?? ''}
                initialContent={editingNote?.content ?? ''}
                initialTags={editingNote?.tags ?? []}
                submitLabel={
                  editingNote
                    ? (updateMutation.isPending ? 'Saving...' : 'Save changes')
                    : (createMutation.isPending ? 'Saving...' : 'Create note')
                }
                isPending={editingNote ? updateMutation.isPending : createMutation.isPending}
                onCancel={resetEditorState}
                onSubmit={editingNote ? handleUpdate : handleCreate}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {isSearchPending ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          Searching notes...
        </motion.p>
      ) : null}

      <div
        className={
          viewMode === 'grid'
            ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
            : 'grid gap-3'
        }
      >
        <AnimatePresence>
          {visibleNotes.map((note, index) => (
            <motion.article
              key={note.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.94 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              whileHover={{ scale: 1.01 }}
              className="group rounded-2xl border bg-background p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={`/notes/${note.id}`} className="font-semibold leading-tight hover:underline">
                  {note.title}
                </Link>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingNoteId(note.id);
                      setIsEditorOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleFavoriteToggle(note.id, Boolean(note.favorite))}
                  >
                    <Star className={`h-4 w-4 ${note.favorite ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(note.id, note.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">
                {stripHtml(note.content) || 'No content'}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {(note.tags ?? []).length > 0 ? (
                  (note.tags ?? []).map((tag) => (
                    <Badge key={`${note.id}-${tag}`} variant="secondary">
                      #{tag}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">No tags</Badge>
                )}
              </div>

              <p className="mt-3 text-xs text-muted-foreground">Updated {formatDate(note.updatedAt)}</p>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {visibleNotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <p className="text-base font-medium">No notes found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first note or change filters/search to view existing notes.
          </p>
        </div>
      ) : null}

      {!useInfiniteMode ? (
        <div className="fixed bottom-6 left-17 z-30">
          <div className="inline-flex items-center gap-2 rounded-lg px-2 py-1 shadow-sm backdrop-blur">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Prev
            </Button>
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        <div ref={sentinelRef} className="h-1" />
      )}

      <ConfirmActionDialog
        open={Boolean(noteToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setNoteToDelete(null);
          }
        }}
        title="Delete note"
        description={
          noteToDelete
            ? `Are you sure you want to delete \"${noteToDelete.title}\"? This action cannot be undone.`
            : 'Are you sure you want to delete this note?'
        }
        confirmLabel="Delete note"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
    </ContentReveal>
  );
}
