import type { CreateNotePayload, Note } from './notes.types';

function buildDuplicateTitle(title: string): string {
  const normalizedTitle = title.trim() || 'Untitled note';
  const copyMatch = normalizedTitle.match(/^(.*) \(Copy(?: (\d+))?\)$/);

  if (!copyMatch) {
    return `${normalizedTitle} (Copy)`;
  }

  const sourceTitle = copyMatch[1]?.trim() || 'Untitled note';
  const currentCopyNumber = Number(copyMatch[2] ?? '1');
  return `${sourceTitle} (Copy ${currentCopyNumber + 1})`;
}

export function buildDuplicateNotePayload(
  note: Pick<Note, 'title' | 'content' | 'tags'>,
): CreateNotePayload {
  return {
    title: buildDuplicateTitle(note.title),
    content: note.content,
    tags: note.tags ?? [],
    isFavorite: false,
  };
}