"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  CalendarClock,
  CircleDot,
  Clock3,
  Compass,
  Lightbulb,
  Music2,
  Pause,
  Play,
  Sparkles,
  StickyNote,
  Users,
  Waves,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DailyMoodOrb, type MoodKind } from "@/components/common/DailyMoodOrb";
import { RealTimeClock } from "@/components/common/RealTimeClock";
import { cn } from "@/lib/utils";
import { notesService } from "@/features/notes/shared/data/notes.service";
import { notesQueryKeys } from "@/features/notes/shared/data/notes.query-keys";
import { remindersService } from "@/features/reminders/shared/data/reminders.service";
import { circlesService } from "@/features/circles/shared/data/circles.service";
import { musicService } from "@/features/music/shared/data/music.service";
import { usersService } from "@/features/users/shared/data/users.service";
import { usersQueryKeys } from "@/features/users/shared/data/users.query-keys";

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
  });
}

function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function relativeFromNow(value: string) {
  const now = Date.now();
  const target = new Date(value).getTime();
  const diffMs = target - now;
  const absMinutes = Math.round(Math.abs(diffMs) / 60000);

  if (absMinutes < 60) {
    return diffMs >= 0 ? `in ${absMinutes}m` : `${absMinutes}m ago`;
  }

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) {
    return diffMs >= 0 ? `in ${absHours}h` : `${absHours}h ago`;
  }

  const absDays = Math.round(absHours / 24);
  return diffMs >= 0 ? `in ${absDays}d` : `${absDays}d ago`;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "EF";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function guessTrackName(url: string, index: number) {
  const parsed = url.split("/").pop() ?? "";
  const cleaned = decodeURIComponent(parsed)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

  if (!cleaned) {
    return `Track ${index + 1}`;
  }

  return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const moodOptions: Array<{
  value: MoodKind;
  label: string;
  emoji: string;
  note: string;
}> = [
  { value: "calm", label: "Calm", emoji: "😌", note: "Grounded and easy" },
  {
    value: "focused",
    label: "Focused",
    emoji: "🧠",
    note: "Clear and intentional",
  },
  {
    value: "joyful",
    label: "Joyful",
    emoji: "😊",
    note: "Warm and optimistic",
  },
  {
    value: "reflective",
    label: "Reflective",
    emoji: "🌙",
    note: "Quiet and introspective",
  },
];

export function DashboardOverview() {
  const { data: me } = useQuery({
    queryKey: usersQueryKeys.me(),
    queryFn: usersService.getMe,
  });
  const { data: notes = [], isPending: notesPending } = useQuery({
    queryKey: notesQueryKeys.list(),
    queryFn: notesService.list,
  });
  const { data: reminders = [] } = useQuery({
    queryKey: ["dashboard", "reminders"],
    queryFn: () => remindersService.listAll({ isCompleted: false, limit: 30 }),
  });
  const { data: circles = [] } = useQuery({
    queryKey: ["dashboard", "circles"],
    queryFn: circlesService.list,
  });
  const { data: playlists = [] } = useQuery({
    queryKey: ["dashboard", "music-playlists"],
    queryFn: musicService.list,
  });

  const [isMoodJournalOpen, setIsMoodJournalOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodKind>("calm");
  const [moodJournalText, setMoodJournalText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);

  const topReminders = useMemo(
    () =>
      reminders
        .slice()
        .sort(
          (a, b) =>
            new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime(),
        )
        .slice(0, 4),
    [reminders],
  );

  const recentNotes = useMemo(
    () =>
      notes
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 8),
    [notes],
  );

  const activeCircles = useMemo(() => circles.slice(0, 4), [circles]);
  const quickPlayerPlaylist = playlists[0];
  const quickPlayerTracks = quickPlayerPlaylist?.urls ?? [];
  const activeTrackUrl = quickPlayerTracks[trackIndex] ?? "";

  const smartSuggestions = useMemo(() => {
    const suggestions: Array<{
      id: string;
      title: string;
      description: string;
      href: string;
    }> = [];

    if (topReminders.length) {
      suggestions.push({
        id: "reminder-focus",
        title: "Prep your next reminder block",
        description: `${topReminders.length} reminder(s) pending. Stay on track without missing key tasks.`,
        href: "/reminders",
      });
    }

    if (activeCircles.length) {
      suggestions.push({
        id: "circle-touchpoint",
        title: "Share one update in a circle",
        description:
          "A quick status update keeps everyone aligned, improves transparency, and reduces unnecessary follow-ups later.",
        href: "/circles",
      });
    }

    if (quickPlayerPlaylist) {
      suggestions.push({
        id: "music-ritual",
        title: "Start a focus music ritual",
        description: `Resume ${quickPlayerPlaylist.name} for calm momentum and a smoother transition into your work session.`,
        href: "/music",
      });
    }

    if (!suggestions.length) {
      suggestions.push({
        id: "bootstrap",
        title: "Create your first workflow loop",
        description:
          "Add one note, one reminder, and one playlist to activate your full EchoFlow dashboard experience.",
        href: "/notes",
      });
    }

    return suggestions.slice(0, 3);
  }, [activeCircles.length, quickPlayerPlaylist, topReminders.length]);

  useEffect(() => {
    if (!isPlaying || !quickPlayerTracks.length) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setMusicProgress((current) => {
        if (current >= 100) {
          setTrackIndex((index) => (index + 1) % quickPlayerTracks.length);
          return 0;
        }

        return current + 3;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying, quickPlayerTracks.length]);

  useEffect(() => {
    setMusicProgress(0);
  }, [trackIndex]);

  const quickNavCards = [
    {
      href: "/notes",
      label: "Open Notes",
      icon: StickyNote,
      accent: "from-sky-500/20 to-indigo-500/10",
    },
    {
      href: "/reminders",
      label: "Check Reminders",
      icon: Bell,
      accent: "from-amber-500/20 to-orange-500/10",
    },
    {
      href: "/circles",
      label: "Visit Circles",
      icon: Users,
      accent: "from-rose-500/20 to-fuchsia-500/10",
    },
    {
      href: "/music",
      label: "Start Music",
      icon: Music2,
      accent: "from-cyan-500/20 to-blue-500/10",
    },
  ];

  const handleSaveMoodJournal = () => {
    if (!moodJournalText.trim()) {
      toast.info("Add a short note to save your mood reflection.");
      return;
    }

    const moodLabel =
      moodOptions.find((option) => option.value === selectedMood)?.label ??
      "Mood";
    toast.success(`${moodLabel} reflection saved`);
    setMoodJournalText("");
    setIsMoodJournalOpen(false);
  };

  return (
    <div className="relative  w-full space-y-6 pb-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 text-white shadow-[0_28px_80px_-46px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:p-8"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] xl:gap-7">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-100/85">
              <Sparkles className="h-3.5 w-3.5" />
              Daily briefing
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back{me?.name ? `, ${me.name.split(" ")[0]}` : ""}. Your
                day is ready.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Stay in flow with your notes, reminders, circles, and music in
                one living dashboard built for calm momentum.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Notes
                </p>
                <p className="mt-2 text-3xl font-semibold">{notes.length}</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Upcoming
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {topReminders.length}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Active circles
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {activeCircles.length}
                </p>
              </div>
            </div>
            <DailyMoodOrb
              mood={selectedMood}
              onOpenJournal={() => setIsMoodJournalOpen(true)}
            />
          </div>

          <div className="space-y-4 self-start">
            <RealTimeClock />

            <div className="relative overflow-hidden rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-sky-400/20 via-indigo-400/10 to-transparent p-5">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/15 bg-white/10" />
              <div className="absolute bottom-3 left-3 h-20 w-20 rounded-full border border-white/15 bg-cyan-200/15" />
              <div className="relative space-y-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/65">
                  Today at a glance
                </p>
                <p className="text-2xl font-semibold">
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                  })}
                </p>
                <div className="space-y-2 text-sm leading-6 text-white/80">
                  <p className="flex w-full items-start gap-2">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />{" "}
                    <span>
                      {topReminders[0]
                        ? `Next: ${topReminders[0].title}`
                        : "No urgent reminders"}
                    </span>
                  </p>
                  <p className="flex w-full items-start gap-2">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0" />{" "}
                    <span>
                      {recentNotes[0]
                        ? `Recent note: ${recentNotes[0].title}`
                        : "Capture your first note"}
                    </span>
                  </p>
                  <p className="flex w-full items-start gap-2">
                    <Music2 className="mt-0.5 h-4 w-4 shrink-0" />{" "}
                    <span>
                      {quickPlayerPlaylist
                        ? `${quickPlayerPlaylist.name} ready`
                        : "Create a focus playlist"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mt-1 grid gap-4 pt-2 sm:grid-cols-2 xl:grid-cols-4">
        {quickNavCards.map((card, index) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 * index }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="group"
          >
            <Link
              href={card.href}
              className={cn(
                "relative flex min-h-[84px] items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.65)] transition-colors hover:border-cyan-400/35",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-70",
                  card.accent,
                )}
              />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/70 text-foreground">
                <card.icon className="h-5 w-5" />
              </div>
              <div className="relative min-w-0 flex-1">
                <p className="font-medium">{card.label}</p>
                <p className="text-xs text-muted-foreground">Quick jump</p>
              </div>
              <Compass className="relative h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="h-full xl:col-span-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Daily focus plan
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Build calm momentum
              </h2>
            </div>
            <div className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
              {topReminders.length} task{topReminders.length === 1 ? "" : "s"}{" "}
              queued
            </div>
          </div>

          <div className="mt-4 space-y-2 rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Right now
            </p>
            <p className="text-sm text-foreground/90">
              {topReminders[0]
                ? `Next reminder: ${topReminders[0].title}`
                : "No urgent reminders. Great time to plan your next focus block."}
            </p>
            <p className="text-sm text-foreground/90">
              {recentNotes[0]
                ? `Recent note: ${recentNotes[0].title}`
                : "No recent notes yet. Capture one key insight to start your day."}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              className="rounded-full"
              onClick={() => window.location.assign("/reminders")}
            >
              Plan reminders
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => window.location.assign("/notes")}
            >
              Open notes
            </Button>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="h-full xl:col-span-5 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Recent notes
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Memory lane
              </h2>
            </div>
            <Link
              href="/notes"
              className="text-sm font-medium text-cyan-600 hover:underline"
            >
              Open Notes
            </Link>
          </div>

          <div className="-mx-5 mt-4 overflow-x-auto px-5 pb-1">
            <div className="flex gap-3">
              {notesPending ? (
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                  Loading notes...
                </div>
              ) : recentNotes.length ? (
                recentNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    whileHover={{ y: -2 }}
                    className="min-w-[240px] max-w-[280px] rounded-2xl border border-border/70 bg-background/70 p-4"
                  >
                    <p className="line-clamp-1 font-medium">{note.title}</p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {stripHtml(note.content) || "No content yet"}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatShortDate(note.updatedAt)}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                  No recent notes yet.
                </div>
              )}
            </div>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.11 }}
          className="h-full xl:col-span-3 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Upcoming reminders
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Stay ahead
              </h2>
            </div>
            <Bell className="h-5 w-5 text-amber-500" />
          </div>

          <div className="mt-4 space-y-3">
            {topReminders.length ? (
              topReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="rounded-xl border border-border/70 bg-background/70 p-3"
                >
                  <p className="font-medium">{reminder.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatLongDate(reminder.remindAt)} •{" "}
                    {relativeFromNow(reminder.remindAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                No reminders lined up.
              </p>
            )}
          </div>
        </motion.article>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.14 }}
          className="h-full xl:col-span-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Active circles
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                People in your loop
              </h2>
            </div>
            <Users className="h-5 w-5 text-rose-500" />
          </div>

          <div className="mt-4 space-y-3">
            {activeCircles.length ? (
              activeCircles.map((circle) => {
                const acceptedMembers = (circle.members ?? []).filter(
                  (member) => member.status === "accepted",
                );
                const fallbackName = circle.name.split(" ")[0] || "Member";
                const names = acceptedMembers.length
                  ? acceptedMembers.map(
                      (member) => member.user?.name || fallbackName,
                    )
                  : [fallbackName, `${fallbackName} Team`];

                return (
                  <div
                    key={circle.id}
                    className="rounded-xl border border-border/70 bg-background/70 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{circle.name}</p>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {Math.max(acceptedMembers.length, 1)} members
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <AvatarGroup>
                        {names.slice(0, 4).map((name, index) => (
                          <Avatar key={`${circle.id}-${name}-${index}`}>
                            <AvatarFallback>{initials(name)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {names.length > 4 ? (
                          <AvatarGroupCount>
                            +{names.length - 4}
                          </AvatarGroupCount>
                        ) : null}
                      </AvatarGroup>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                No active circles yet.
              </p>
            )}
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.17 }}
          className="h-full xl:col-span-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Music quick player
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Flow soundtrack
              </h2>
            </div>
            <Waves className="h-5 w-5 text-cyan-500" />
          </div>

          {quickPlayerPlaylist ? (
            <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="font-medium">{quickPlayerPlaylist.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeTrackUrl
                  ? guessTrackName(activeTrackUrl, trackIndex)
                  : "No tracks available"}
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                  animate={{ width: `${musicProgress}%` }}
                  transition={{ ease: "linear", duration: 0.8 }}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={() => setIsPlaying((value) => !value)}
                  disabled={!quickPlayerTracks.length}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={!quickPlayerTracks.length}
                  onClick={() =>
                    setTrackIndex(
                      (index) => (index + 1) % quickPlayerTracks.length,
                    )
                  }
                >
                  Next track
                </Button>
                <Link
                  href="/music"
                  className="text-sm font-medium text-cyan-600 hover:underline"
                >
                  Open music
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
              Create a playlist to activate quick player.
            </p>
          )}
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="h-full xl:col-span-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Smart suggestions
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Gentle next actions
              </h2>
            </div>
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>

          <div className="mt-4 space-y-3">
            {smartSuggestions.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-border/70 bg-background/70 p-3"
              >
                <div className="flex items-start gap-2">
                  <CircleDot className="mt-1 h-4 w-4 text-cyan-500" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <Link
                      href={item.href}
                      className="mt-2 inline-block text-xs font-medium uppercase tracking-[0.16em] text-cyan-600 hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.article>
      </section>

      <AnimatePresence>
        {isMoodJournalOpen ? (
          <motion.div
            key="mood-journal-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[72] bg-slate-950/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute inset-x-4 top-[12vh] mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(140deg,rgba(34,211,238,0.12),rgba(59,130,246,0.12),rgba(15,23,42,0.96))] p-6 text-white shadow-[0_34px_95px_-50px_rgba(56,189,248,0.85)]"
            >
              <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-cyan-300/18 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-400/18 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/75">
                    Mood journal
                  </p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                    How are you feeling today?
                  </h3>
                  <p className="mt-2 text-sm text-cyan-50/80">
                    Pick your mood and jot a short reflection to preserve
                    today&apos;s emotional snapshot.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setIsMoodJournalOpen(false)}
                  aria-label="Close mood journal"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative mt-5 grid gap-2.5 sm:grid-cols-2">
                {moodOptions.map((option) => {
                  const isActive = selectedMood === option.value;

                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMood(option.value)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                        isActive
                          ? "border-cyan-200/60 bg-cyan-300/20 text-cyan-50"
                          : "border-white/20 bg-white/5 text-white/90 hover:bg-white/10",
                      )}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span>
                        <span className="block text-sm font-medium">
                          {option.label}
                        </span>
                        <span className="block text-xs text-white/65">
                          {option.note}
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="relative mt-5">
                <Textarea
                  value={moodJournalText}
                  onChange={(event) => setMoodJournalText(event.target.value)}
                  placeholder="Write a few lines about what shaped your mood today..."
                  className="min-h-32 resize-none rounded-2xl border-white/20 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-cyan-50 placeholder:text-cyan-100/40"
                />
              </div>

              <div className="relative mt-5 flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="rounded-full bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                  onClick={handleSaveMoodJournal}
                >
                  Save reflection
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setMoodJournalText("")}
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
