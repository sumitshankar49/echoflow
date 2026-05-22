export interface NoteMeta {
  favorite: boolean;
  tags: string[];
}

const NOTES_META_KEY = 'notes_meta_v1';

function readStore(): Record<string, NoteMeta> {
  if (typeof window === 'undefined') {
    return {};
  }

  const raw = localStorage.getItem(NOTES_META_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, NoteMeta>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, NoteMeta>) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(NOTES_META_KEY, JSON.stringify(store));
}

export function getNotesMetaMap() {
  return readStore();
}

export function getNoteMeta(noteId: string): NoteMeta {
  const store = readStore();
  return store[noteId] ?? { favorite: false, tags: [] };
}

export function setNoteMeta(noteId: string, nextMeta: Partial<NoteMeta>): NoteMeta {
  const store = readStore();
  const previous = store[noteId] ?? { favorite: false, tags: [] };

  const merged: NoteMeta = {
    favorite: nextMeta.favorite ?? previous.favorite,
    tags: nextMeta.tags ?? previous.tags,
  };

  store[noteId] = merged;
  writeStore(store);

  return merged;
}

export function toggleNoteFavorite(noteId: string) {
  const current = getNoteMeta(noteId);
  return setNoteMeta(noteId, { favorite: !current.favorite });
}