'use client';

import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpenText,
  Brain,
  Clock3,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ShimmerCard } from '@/components/common/ShimmerCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/shared/utils/use-debounced-value';
import { memoriesQueryKeys } from '@/features/memories/shared/data/memories.query-keys';
import { memoriesService } from '@/features/memories/shared/data/memories.service';
import type { Memory, MemorySourceType } from '@/features/memories/shared/domain/memories.types';

type SourceChip = 'all' | MemorySourceType;
type ViewMode = 'timeline' | 'grid';

const sourceChips: Array<{ key: SourceChip; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'note', label: 'Notes' },
  { key: 'journal', label: 'Journal' },
  { key: 'task', label: 'Tasks' },
];

const sourceStyle: Record<MemorySourceType, string> = {
  note: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  journal: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
  task: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
};

function formatSource(sourceType: MemorySourceType) {
  if (sourceType === 'note') return 'Note';
  if (sourceType === 'journal') return 'Journal';
  return 'Task';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function timeAgo(value: string) {
  const date = new Date(value).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - date);

  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) return `${minutes || 1}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(months / 12)}y ago`;
}

function previewText(content: string) {
  return content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function MemoryCard({ memory, timeline = false }: { memory: Memory; timeline?: boolean }) {
  return (
    <motion.article
      layout
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_8px_24px_-18px_rgba(10,10,10,0.5)] backdrop-blur-sm',
        'before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300',
        'before:bg-[radial-gradient(600px_circle_at_var(--x,50%)_-20%,rgba(255,255,255,0.2),transparent_40%)] hover:before:opacity-100',
        'hover:border-amber-300/50 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.25),0_20px_40px_-24px_rgba(245,158,11,0.5)] dark:hover:border-amber-500/40'
      )}
      style={{ ['--x' as string]: timeline ? '18%' : '50%' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-foreground">{memory.title}</h3>
          <p className="text-xs text-muted-foreground">{formatDate(memory.createdAt)} • {timeAgo(memory.updatedAt)}</p>
        </div>
        <Badge className={cn('border-0', sourceStyle[memory.sourceType])}>{formatSource(memory.sourceType)}</Badge>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{previewText(memory.content) || 'No content yet.'}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {memory.tags.length > 0 ? (
          memory.tags.slice(0, 4).map((tag) => (
            <span
              key={`${memory.id}-${tag}`}
              className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-1 text-xs text-muted-foreground"
            >
              <Tag className="h-3 w-3" /> {tag}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-muted/80 px-2.5 py-1 text-xs text-muted-foreground">No tags</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Importance score</span>
        <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 font-semibold text-white">
          {memory.importanceScore.toFixed(1)}
        </span>
      </div>
    </motion.article>
  );
}

function LoadingShimmers() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={`memory-shimmer-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <ShimmerCard lineCount={4} showAvatar delay={index * 0.06} className="h-[220px]" />
          <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/35 to-transparent dark:via-white/10" />
        </motion.div>
      ))}
    </div>
  );
}

function EmptyMemoriesState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-dashed border-amber-300/50 bg-gradient-to-br from-amber-50/60 via-orange-50/50 to-teal-50/50 p-8 text-center dark:border-amber-700/40 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-teal-950/20"
    >
      <div className="mx-auto mb-4 w-fit rounded-2xl bg-background/75 p-4 shadow-sm backdrop-blur">
        <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M10 55C25 38 37 36 47 44C57 52 67 49 80 32" stroke="currentColor" strokeWidth="2" className="text-amber-500" />
          <path d="M8 59H82" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
          <circle cx="24" cy="28" r="6" className="fill-amber-300/70" />
          <circle cx="50" cy="22" r="5" className="fill-rose-300/70" />
          <circle cx="66" cy="16" r="4" className="fill-teal-300/70" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{hasQuery ? 'No memory echoes found' : 'Your memory archive is still blank'}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
        {hasQuery
          ? 'Try a softer phrase, related tags, or another source filter. Your timeline learns from context.'
          : 'As you write notes, journals, and tasks, EchoFlow will stitch them into an intelligent nostalgic timeline.'}
      </p>
    </motion.div>
  );
}

export function MemoryListView() {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [chip, setChip] = useState<SourceChip>('all');
  const [query, setQuery] = useState('');
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 220);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  const { data: listPayload, isPending, isFetching, isError } = useQuery({
    queryKey: memoriesQueryKeys.list({ page: 1, limit: 100 }),
    queryFn: () => memoriesService.list({ page: 1, limit: 100 }),
  });

  const { data: searchedMemories = [] } = useQuery({
    queryKey: memoriesQueryKeys.search(debouncedQuery),
    queryFn: () => memoriesService.search(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });

  const allMemories = listPayload?.data ?? [];
  const sourceMemories = debouncedQuery.trim().length > 0 ? searchedMemories : allMemories;

  const filtered = useMemo(() => {
    return sourceMemories.filter((memory) => {
      if (chip !== 'all' && memory.sourceType !== chip) {
        return false;
      }

      if (!debouncedQuery.trim()) {
        return true;
      }

      const lowered = debouncedQuery.toLowerCase();
      const haystack = `${memory.title} ${memory.content} ${memory.tags.join(' ')}`.toLowerCase();
      return haystack.includes(lowered);
    });
  }, [sourceMemories, chip, debouncedQuery]);

  const searchSuggestions = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const lowered = query.toLowerCase();
    const titleSuggestions = sourceMemories
      .filter((memory) => memory.title.toLowerCase().includes(lowered))
      .slice(0, 4)
      .map((memory) => memory.title);

    const tagSuggestions = sourceMemories
      .flatMap((memory) => memory.tags)
      .filter((tag) => tag.toLowerCase().includes(lowered))
      .slice(0, 4)
      .map((tag) => `#${tag}`);

    return Array.from(new Set([...titleSuggestions, ...tagSuggestions])).slice(0, 6);
  }, [query, sourceMemories]);

  useEffect(() => {
    function onOutsideClick(event: MouseEvent) {
      if (!suggestionsRef.current) {
        return;
      }

      if (!suggestionsRef.current.contains(event.target as Node)) {
        setIsSuggestionOpen(false);
      }
    }

    window.addEventListener('mousedown', onOutsideClick);
    return () => window.removeEventListener('mousedown', onOutsideClick);
  }, []);

  if (isError) {
    return <p className="text-sm text-red-500">Unable to load memories right now.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-[linear-gradient(140deg,rgba(255,247,237,0.88),rgba(236,253,245,0.84),rgba(255,241,242,0.8))] p-5 shadow-[0_26px_70px_-48px_rgba(251,146,60,0.65)] dark:bg-[linear-gradient(140deg,rgba(67,20,7,0.45),rgba(4,47,46,0.35),rgba(76,5,25,0.35))] sm:p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-300/35 blur-3xl dark:bg-amber-600/20" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-teal-300/30 blur-3xl dark:bg-teal-500/20" />

        <div className="relative space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Nostalgic Intelligence Layer
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Memories</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Weaving your notes, journals, and tasks into a living timeline.
              </p>
            </div>

            <div className="inline-flex items-center rounded-xl border bg-background/75 p-1 shadow-sm backdrop-blur">
              <Button
                type="button"
                size="sm"
                variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                onClick={() => setViewMode('timeline')}
                className="gap-1"
              >
                <List className="h-4 w-4" /> Timeline
              </Button>
              <Button
                type="button"
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="gap-1"
              >
                <LayoutGrid className="h-4 w-4" /> Grid
              </Button>
            </div>
          </div>

          <div ref={suggestionsRef} className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsSuggestionOpen(true);
              }}
              onFocus={() => setIsSuggestionOpen(true)}
              placeholder="Search moments, topics, tags, or intent..."
              className="h-11 rounded-xl border-border/60 bg-background/80 pl-9"
            />

            <AnimatePresence>
              {isSuggestionOpen && searchSuggestions.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute z-30 mt-2 w-full rounded-xl border border-border/70 bg-background/95 p-2 shadow-xl backdrop-blur"
                >
                  {searchSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onMouseDown={() => {
                        setQuery(suggestion.replace(/^#/, ''));
                        setIsSuggestionOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-muted"
                    >
                      <Brain className="h-4 w-4 text-amber-500" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sourceChips.map((item) => (
              <Button
                key={item.key}
                type="button"
                size="sm"
                variant={chip === item.key ? 'default' : 'secondary'}
                onClick={() => setChip(item.key)}
                className={cn(
                  'rounded-full',
                  chip === item.key ? 'shadow-[0_0_0_1px_rgba(0,0,0,0.05)]' : ''
                )}
              >
                {item.label}
              </Button>
            ))}

            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              {isFetching ? 'Syncing memories...' : `${filtered.length} memories surfaced`}
            </span>
          </div>
        </div>
      </section>

      {isPending ? <LoadingShimmers /> : null}

      {!isPending && filtered.length === 0 ? <EmptyMemoriesState hasQuery={Boolean(query.trim())} /> : null}

      {!isPending && filtered.length > 0 ? (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.06,
              },
            },
          }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((memory) => (
                <motion.div
                  key={memory.id}
                  variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                >
                  <MemoryCard memory={memory} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="relative space-y-4 pl-0 sm:pl-6">
              <div className="absolute left-2 top-0 hidden h-full w-px bg-gradient-to-b from-amber-300/60 via-orange-300/40 to-transparent sm:block dark:from-amber-600/40 dark:via-orange-500/30" />
              {filtered.map((memory) => (
                <motion.div
                  key={memory.id}
                  variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                  className="relative"
                >
                  <div className="absolute left-0 top-8 hidden h-3.5 w-3.5 rounded-full border-2 border-amber-300 bg-background sm:block dark:border-amber-600" />
                  <div className="sm:pl-7">
                    <MemoryCard memory={memory} timeline />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      ) : null}

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <div className="rounded-2xl border border-border/50 bg-card/60 p-4 text-xs text-muted-foreground backdrop-blur">
        <p className="inline-flex items-center gap-2">
          <BookOpenText className="h-4 w-4 text-amber-500" />
          Memories are sorted by contextual relevance, importance, and freshness to feel intelligent and nostalgic.
        </p>
      </div>
    </div>
  );
}
