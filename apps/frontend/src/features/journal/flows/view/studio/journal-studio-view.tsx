'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Italic,
  List,
  ListOrdered,
  Loader2,
  PenLine,
  Smile,
  Tag,
  Trash2,
  Type,
  Underline,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ContentReveal } from '@/components/common/ContentReveal';
import { ShimmerCard } from '@/components/common/ShimmerCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { journalQueryKeys } from '@/features/journal/shared/data/journal.query-keys';
import { journalService } from '@/features/journal/shared/data/journal.service';
import type { JournalEntry, JournalMood } from '@/features/journal/shared/domain/journal.types';

const moodOptions: Array<{
  mood: JournalMood;
  emoji: string;
  label: string;
  ringClass: string;
}> = [
  { mood: 'happy', emoji: '😊', label: 'Happy', ringClass: 'ring-yellow-300/70 dark:ring-yellow-500/60' },
  { mood: 'calm', emoji: '😌', label: 'Calm', ringClass: 'ring-sky-300/70 dark:ring-sky-500/60' },
  { mood: 'neutral', emoji: '🙂', label: 'Neutral', ringClass: 'ring-zinc-300/70 dark:ring-zinc-500/60' },
  { mood: 'anxious', emoji: '😟', label: 'Anxious', ringClass: 'ring-orange-300/70 dark:ring-orange-500/60' },
  { mood: 'sad', emoji: '😔', label: 'Sad', ringClass: 'ring-indigo-300/70 dark:ring-indigo-500/60' },
  { mood: 'excited', emoji: '🤩', label: 'Excited', ringClass: 'ring-rose-300/70 dark:ring-rose-500/60' },
];

const formatButtons: Array<{
  command: 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList';
  label: string;
  icon: typeof Type;
}> = [
  { command: 'bold', label: 'Bold', icon: Type },
  { command: 'italic', label: 'Italic', icon: Italic },
  { command: 'underline', label: 'Underline', icon: Underline },
  { command: 'insertUnorderedList', label: 'Bullets', icon: List },
  { command: 'insertOrderedList', label: 'Numbers', icon: ListOrdered },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function stripHtml(content: string) {
  return content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function JournalStudioView() {
  const queryClient = useQueryClient();
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(toDateInputValue());
  const [moodFilter, setMoodFilter] = useState<JournalMood | ''>('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalMood>('calm');
  const [tagsInput, setTagsInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedPulse, setSavedPulse] = useState(false);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  const { data: entries = [], isPending, isError } = useQuery({
    queryKey: journalQueryKeys.list({ date: selectedDate, ...(moodFilter ? { mood: moodFilter } : {}) }),
    queryFn: () => journalService.list({ date: selectedDate, ...(moodFilter ? { mood: moodFilter } : {}) }),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      id?: string;
      title: string;
      content: string;
      mood: JournalMood;
      tags: string[];
      date: string;
    }) => {
      if (payload.id) {
        return journalService.update(payload.id, payload);
      }

      return journalService.create(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: journalQueryKeys.all });
      setSavedPulse(true);
      window.setTimeout(() => setSavedPulse(false), 1200);
      toast.success(editingId ? 'Journal updated beautifully' : 'Journal saved beautifully');
      if (!editingId) {
        setTitle('');
        setContent('');
        setTagsInput('');
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
      }
      setEditingId(null);
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        toast.error('Session expired — please log in again');
      } else {
        toast.error('Could not save journal entry right now');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => journalService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: journalQueryKeys.all });
      toast.success('Journal entry deleted');
    },
    onError: () => toast.error('Could not delete journal entry'),
  });

  const parsedTags = useMemo(
    () =>
      tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8),
    [tagsInput],
  );

  const editorHasText = useMemo(() => stripHtml(content).length > 0, [content]);

  const syncActiveFormats = () => {
    if (typeof document === 'undefined') {
      return;
    }

    const active = formatButtons
      .filter((item) => document.queryCommandState(item.command))
      .map((item) => item.command);
    setActiveFormats(active);
  };

  const applyFormat = (
    command: 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList',
  ) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    syncActiveFormats();
  };

  const submitEntry = async () => {
    if (!title.trim()) {
      toast.info('Please add a journal title');
      return;
    }

    if (!stripHtml(content)) {
      toast.info('Please write a few thoughts');
      return;
    }

    await saveMutation.mutateAsync({
      ...(editingId ? { id: editingId } : {}),
      title: title.trim(),
      content,
      mood,
      tags: parsedTags,
      date: selectedDate,
    });
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setTagsInput(entry.tags.join(', '));
    if (editorRef.current) {
      editorRef.current.innerHTML = entry.content;
    }
    window.setTimeout(syncActiveFormats, 0);
  };

  return (
    <ContentReveal
      loading={isPending}
      loader={
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <ShimmerCard key={index} lineCount={4} className="h-[180px]" delay={index * 0.06} />
          ))}
        </div>
      }
    >
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-[linear-gradient(130deg,rgba(241,245,249,0.95),rgba(236,253,245,0.86),rgba(239,246,255,0.86))] p-5 shadow-[0_24px_70px_-50px_rgba(56,189,248,0.65)] dark:bg-[linear-gradient(130deg,rgba(12,20,28,0.95),rgba(10,30,28,0.86),rgba(10,20,35,0.86))] sm:p-6"
        >
          <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-sky-300/35 blur-3xl dark:bg-sky-500/20" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-emerald-300/35 blur-3xl dark:bg-emerald-500/20" />

          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Calm Writing Space</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Journal</h1>
              <p className="mt-1 text-sm text-muted-foreground">Pause, breathe, and capture your day with intention.</p>
            </div>

            <motion.div
              animate={savedPulse ? { scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] } : { scale: 1, opacity: 0.8 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {savedPulse ? 'Saved' : 'Auto-presence mode'}
            </motion.div>
          </div>
        </motion.section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-border/60 bg-card/90 p-4 shadow-[0_12px_38px_-30px_rgba(0,0,0,0.7)] backdrop-blur sm:p-5"
          >
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="journal-date" className="text-xs text-muted-foreground">Journal date</Label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="journal-date"
                      type="date"
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="journal-title" className="text-xs text-muted-foreground">Entry title</Label>
                  <Input
                    id="journal-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="A quiet win from today"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Mood picker</Label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {moodOptions.map((option) => {
                    const selected = mood === option.mood;
                    return (
                      <motion.button
                        key={option.mood}
                        type="button"
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        animate={selected ? { scale: [1, 1.12, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setMood(option.mood)}
                        className={cn(
                          'rounded-2xl border bg-background/80 px-2 py-3 text-center transition-all sm:px-3 sm:py-4',
                          selected
                            ? `ring-2 ${option.ringClass} border-transparent shadow-[0_14px_30px_-22px_rgba(0,0,0,0.8)]`
                            : 'border-border/60 hover:border-border'
                        )}
                      >
                        <div className="text-[1.8rem] sm:text-[2rem]">{option.emoji}</div>
                        <div className="mt-1 text-[11px] font-medium text-muted-foreground">{option.label}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Writing tools</Label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {formatButtons.map((item) => {
                    const Icon = item.icon;
                    const active = activeFormats.includes(item.command);
                    return (
                      <Button
                        key={item.command}
                        type="button"
                        variant={active ? 'default' : 'secondary'}
                        size="sm"
                        onMouseUp={syncActiveFormats}
                        onClick={() => applyFormat(item.command)}
                        className="gap-1.5 whitespace-nowrap"
                      >
                        <Icon className="h-4 w-4" /> {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Entry content</Label>
                <div className="relative">
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(event) => setContent((event.target as HTMLDivElement).innerHTML)}
                    onMouseUp={syncActiveFormats}
                    onKeyUp={syncActiveFormats}
                    className="min-h-56 rounded-2xl border border-border/70 bg-background/90 px-3 py-3 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 sm:min-h-60"
                  />
                  {!editorHasText ? (
                    <div className="pointer-events-none absolute left-3 top-3 text-sm text-muted-foreground/80">
                      Start writing your reflection... what felt meaningful today?
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="journal-tags" className="text-xs text-muted-foreground">Tags</Label>
                <Textarea
                  id="journal-tags"
                  rows={2}
                  value={tagsInput}
                  onChange={(event) => setTagsInput(event.target.value)}
                  placeholder="gratitude, deep-work, reflection"
                />
                <div className="flex flex-wrap gap-1.5">
                  {parsedTags.length > 0 ? (
                    parsedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        <Tag className="h-3 w-3" /> {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Comma-separated tags help you revisit meaningful moments.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                {editingId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setTitle('');
                      setContent('');
                      setTagsInput('');
                      setMood('calm');
                      if (editorRef.current) {
                        editorRef.current.innerHTML = '';
                      }
                    }}
                  >
                    Cancel edit
                  </Button>
                ) : null}

                <motion.div
                  animate={saveMutation.isPending ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                  transition={{ duration: 0.5, repeat: saveMutation.isPending ? Infinity : 0 }}
                >
                  <Button type="button" onClick={submitEntry} disabled={saveMutation.isPending} className="gap-2">
                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
                    {editingId ? 'Update entry' : 'Save entry'}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="space-y-3 rounded-3xl border border-border/60 bg-card/90 p-4 shadow-[0_12px_38px_-30px_rgba(0,0,0,0.7)] backdrop-blur sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Past entries</h2>
                <p className="text-xs text-muted-foreground">Browse by calendar date and mood</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" /> {entries.length} found
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
              <select
                value={moodFilter}
                onChange={(event) => setMoodFilter(event.target.value as JournalMood | '')}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
              >
                <option value="">All moods</option>
                {moodOptions.map((option) => (
                  <option key={option.mood} value={option.mood}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {entries.map((entry, index) => {
                  const moodMeta = moodOptions.find((item) => item.mood === entry.mood) ?? moodOptions[2];

                  return (
                    <motion.article
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="rounded-2xl border border-border/60 bg-[linear-gradient(140deg,rgba(255,255,255,0.94),rgba(250,253,255,0.86))] p-3 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.7)] dark:bg-[linear-gradient(140deg,rgba(30,41,59,0.5),rgba(15,23,42,0.35))]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="line-clamp-1 text-sm font-semibold tracking-tight">{entry.title}</h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl" aria-label={moodMeta.label}>{moodMeta.emoji}</span>
                          <Badge variant="secondary">{moodMeta.label}</Badge>
                        </div>
                      </div>

                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{stripHtml(entry.content) || 'No content'}</p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {entry.tags.length > 0 ? (
                            entry.tags.slice(0, 3).map((tag) => (
                              <span key={`${entry.id}-${tag}`} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                #{tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-muted-foreground">No tags</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button type="button" size="sm" variant="ghost" onClick={() => startEdit(entry)}>
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>

              {isError ? (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center">
                  <AlertTriangle className="mx-auto h-7 w-7 text-destructive" />
                  <p className="mt-2 text-sm font-medium text-destructive">Couldn&apos;t load journal entries</p>
                  <p className="mt-1 text-xs text-muted-foreground">Something went wrong fetching this date. Please try again.</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-center">
                  <Smile className="mx-auto h-7 w-7 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">No entries on this date</p>
                  <p className="mt-1 text-xs text-muted-foreground">Try another day or mood filter, or write a fresh reflection.</p>
                </div>
              ) : null}
            </div>
          </motion.section>
        </div>
      </div>
    </ContentReveal>
  );
}
