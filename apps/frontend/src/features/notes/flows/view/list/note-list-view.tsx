'use client';

import { useNoteList } from './use-note-list';

export function NoteListView() {
  const { data: notes, isPending, isError } = useNoteList();

  if (isPending) return <p className="text-sm text-muted-foreground">Loading notes…</p>;
  if (isError) return <p className="text-sm text-red-500">Failed to load notes.</p>;

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li key={note.id} className="rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold">{note.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{note.content}</p>
        </li>
      ))}
    </ul>
  );
}
