'use client';

import { useNoteDetail } from './use-note-detail';

export function NoteDetailView({ id }: { id: string }) {
  const { data: note, isPending, isError } = useNoteDetail(id);

  if (isPending) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (isError) return <p className="text-sm text-red-500">Note not found.</p>;

  return (
    <article className="space-y-4">
      <h1 className="text-2xl font-bold">{note.title}</h1>
      <p className="whitespace-pre-wrap text-sm">{note.content}</p>
    </article>
  );
}
