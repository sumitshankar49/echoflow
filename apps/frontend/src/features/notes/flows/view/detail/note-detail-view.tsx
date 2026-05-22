'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock3, Loader2, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NoteEditor } from '@/features/notes/flows/manage/editor/note-editor';
import { notesQueryKeys } from '@/features/notes/shared/data/notes.query-keys';
import { notesService } from '@/features/notes/shared/data/notes.service';
import { useNoteDetail } from './use-note-detail';

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NoteDetailView({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { data: note, isPending, isError } = useNoteDetail(id);

  const [isEditing, setIsEditing] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof notesService.update>[1]) => notesService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notesQueryKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: notesQueryKeys.list() });
      toast.success('Note updated');
      setIsEditing(false);
    },
    onError: () => toast.error('Could not update note'),
  });

  const favoriteMutation = useMutation({
    mutationFn: (nextFavorite: boolean) => notesService.update(id, { isFavorite: nextFavorite }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notesQueryKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: notesQueryKeys.list() });
    },
    onError: () => toast.error('Could not update favorite status'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => notesService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notesQueryKeys.list() });
      toast.success('Note deleted');
      window.location.replace('/notes');
    },
    onError: () => toast.error('Could not delete note'),
  });

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (isError || !note) {
    return <p className="text-sm text-red-500">Note not found.</p>;
  }

  const handleFavoriteToggle = () => {
    favoriteMutation.mutate(!Boolean(note.favorite));
  };

  const contentMarkup = useMemo(() => ({ __html: note.content }), [note.content]);

  const handleUpdate = async (payload: { title: string; content: string; tags: string[] }) => {
    await updateMutation.mutateAsync({
      title: payload.title,
      content: payload.content,
      tags: payload.tags,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 rounded-2xl border bg-background p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/notes"
          className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-sm font-medium text-secondary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to notes
        </Link>

        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing((v) => !v)}>
            {isEditing ? 'Preview' : 'Edit'}
          </Button>
          <Button type="button" variant="secondary" size="icon" onClick={handleFavoriteToggle} disabled={favoriteMutation.isPending}>
            <Star className={`h-4 w-4 ${note.favorite ? 'fill-yellow-400 text-yellow-500' : ''}`} />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <NoteEditor
          initialTitle={note.title}
          initialContent={note.content}
          initialTags={note.tags ?? []}
          submitLabel={updateMutation.isPending ? 'Saving...' : 'Save changes'}
          isPending={updateMutation.isPending}
          onCancel={() => setIsEditing(false)}
          onSubmit={handleUpdate}
        />
      ) : (
        <>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{note.title}</h1>
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="h-3 w-3" /> Updated {formatDate(note.updatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(note.tags ?? []).length > 0 ? (
              (note.tags ?? []).map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">No tags</Badge>
            )}
          </div>

          <div
            className="prose prose-sm max-w-none rounded-xl border bg-background p-4 dark:prose-invert"
            dangerouslySetInnerHTML={contentMarkup}
          />
        </>
      )}
    </motion.article>
  );
}
