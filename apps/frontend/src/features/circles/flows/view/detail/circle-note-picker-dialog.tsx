'use client';

import { useMemo, useState } from 'react';
import { Search, Star, X } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Note } from '@/features/notes/shared/domain/notes.types';

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

type PickerFilter = 'all' | 'favorites';

interface CircleNotePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  isSharing: boolean;
  onShare: (noteId: string) => void;
}

export function CircleNotePickerDialog({
  open,
  onOpenChange,
  notes,
  isSharing,
  onShare,
}: CircleNotePickerDialogProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PickerFilter>('all');

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return notes.filter((note) => {
      const isFavorite = Boolean(note.isFavorite ?? note.favorite);

      if (filter === 'favorites' && !isFavorite) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [note.title, stripHtml(note.content), ...(note.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [filter, notes, query]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl gap-5 rounded-[1.8rem] border-border/70 p-0 overflow-hidden">
        <div className="bg-[linear-gradient(140deg,rgba(17,24,39,0.98),rgba(30,41,59,0.94),rgba(15,118,110,0.82))] p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <AlertDialogHeader className="space-y-2 text-left">
              <AlertDialogTitle className="text-2xl tracking-tight">Share a note to this circle</AlertDialogTitle>
              <AlertDialogDescription className="max-w-xl text-white/70">
                Pick the right note, skim the preview, and share it without cluttering the circle page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-white/10 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, content, or tag"
                className="h-11 rounded-2xl border-white/10 bg-white/8 pl-9 text-white placeholder:text-white/35"
              />
            </div>

            <Tabs value={filter} onValueChange={(value) => setFilter(value as PickerFilter)}>
              <TabsList className="h-10 bg-white/10">
                <TabsTrigger value="all" className="px-4 text-white data-active:text-slate-950">
                  All notes
                </TabsTrigger>
                <TabsTrigger value="favorites" className="px-4 text-white data-active:text-slate-950">
                  Favorites
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5 pt-0">
          {filteredNotes.length ? (
            filteredNotes.map((note) => {
              const preview = stripHtml(note.content) || 'No content';
              const isFavorite = Boolean(note.isFavorite ?? note.favorite);

              return (
                <div
                  key={note.id}
                  className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.4)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{note.title}</p>
                        {isFavorite ? (
                          <Badge variant="outline" className="rounded-full">
                            <Star className="mr-1 h-3 w-3 fill-current" />
                            Favorite
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{preview}</p>
                      {note.tags?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {note.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="rounded-full">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <Button
                      type="button"
                      onClick={() => onShare(note.id)}
                      disabled={isSharing}
                      className="rounded-full"
                    >
                      Share
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-border/70 bg-background/80 p-8 text-center text-sm text-muted-foreground">
              No notes match this view. Try a different search or switch back to all notes.
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}