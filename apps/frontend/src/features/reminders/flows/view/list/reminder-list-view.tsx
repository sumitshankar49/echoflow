'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ShimmerCard } from '@/components/common/ShimmerCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { remindersQueryKeys } from '@/features/reminders/shared/data/reminders.query-keys';
import { remindersService } from '@/features/reminders/shared/data/reminders.service';
import {
  createReminderSchema,
  type CreateReminderSchema,
} from '@/features/reminders/shared/domain/reminders.schema';
import type {
  Reminder,
  ReminderStatus,
  ReminderUrgency,
} from '@/features/reminders/shared/domain/reminders.types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toISOString(localDatetime: string): string {
  return new Date(localDatetime).toISOString();
}

function getUrgency(remindAt: string, isCompleted: boolean): ReminderUrgency {
  if (isCompleted) return 'done';
  const now = new Date();
  const due = new Date(remindAt);
  if (due < now) return 'overdue';
  const diffHours = (due.getTime() - now.getTime()) / 3_600_000;
  if (diffHours < 24) return 'today';
  if (diffHours < 24 * 7) return 'soon';
  return 'upcoming';
}

function formatRelative(iso: string): string {
  const now = new Date();
  const due = new Date(iso);
  const diffMs = due.getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const mins = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  const past = diffMs < 0;

  if (mins < 2) return 'just now';
  if (mins < 60) return past ? `${mins}m ago` : `in ${mins}m`;
  if (hours < 24) return past ? `${hours}h ago` : `in ${hours}h`;
  if (days === 1) return past ? 'yesterday' : 'tomorrow';
  return past ? `${days}d ago` : `in ${days}d`;
}

function formatFull(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── urgency config ───────────────────────────────────────────────────────────

type UrgencyConfig = {
  border: string;
  bg: string;
  badge: string;
  badgeText: string;
};

const URGENCY_CONFIG: Record<ReminderUrgency, UrgencyConfig> = {
  overdue: {
    border: 'border-l-red-500',
    bg: 'bg-red-50/60 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    badgeText: 'Overdue',
  },
  today: {
    border: 'border-l-orange-400',
    bg: 'bg-orange-50/60 dark:bg-orange-950/20',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    badgeText: 'Due today',
  },
  soon: {
    border: 'border-l-yellow-400',
    bg: 'bg-yellow-50/40 dark:bg-yellow-950/10',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    badgeText: 'This week',
  },
  upcoming: {
    border: 'border-l-blue-400',
    bg: 'bg-blue-50/40 dark:bg-blue-950/10',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    badgeText: 'Upcoming',
  },
  done: {
    border: 'border-l-gray-300 dark:border-l-gray-600',
    bg: '',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    badgeText: 'Done',
  },
};

const URGENCY_ICONS: Record<ReminderUrgency, React.ComponentType<{ className?: string }>> = {
  overdue: BellOff,
  today: Bell,
  soon: CalendarClock,
  upcoming: CalendarClock,
  done: CheckCircle2,
};

// ─── Reminder Form Modal ───────────────────────────────────────────────────────

interface ReminderFormModalProps {
  editing: Reminder | null;
  onClose: () => void;
  onSave: (data: CreateReminderSchema) => Promise<void>;
  isSaving: boolean;
}

function ReminderFormModal({ editing, onClose, onSave, isSaving }: ReminderFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateReminderSchema>({
    resolver: zodResolver(createReminderSchema),
    defaultValues: editing
      ? {
          title: editing.title,
          description: editing.description ?? '',
          remindAt: toLocalDatetimeValue(editing.remindAt),
        }
      : { title: '', description: '', remindAt: '' },
  });

  useEffect(() => {
    if (editing) {
      reset({
        title: editing.title,
        description: editing.description ?? '',
        remindAt: toLocalDatetimeValue(editing.remindAt),
      });
    } else {
      reset({ title: '', description: '', remindAt: '' });
    }
  }, [editing, reset]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">{editing ? 'Edit Reminder' : 'New Reminder'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rm-title">Title</Label>
            <Input
              id="rm-title"
              placeholder="e.g. Take vitamins"
              {...register('title')}
              autoFocus
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rm-desc">
              Description{' '}
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="rm-desc"
              placeholder="Any extra details…"
              rows={3}
              className="resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rm-date" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Due date &amp; time
            </Label>
            <Input
              id="rm-date"
              type="datetime-local"
              className="cursor-pointer"
              {...register('remindAt')}
            />
            {errors.remindAt && (
              <p className="text-xs text-red-500">{errors.remindAt.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create reminder'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Reminder Card ─────────────────────────────────────────────────────────────

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
}

function ReminderCard({
  reminder,
  onToggle,
  onEdit,
  onDelete,
  isToggling,
  isDeleting,
}: ReminderCardProps) {
  const urgency = getUrgency(reminder.remindAt, reminder.isCompleted);
  const cfg = URGENCY_CONFIG[urgency];
  const UrgencyIcon = URGENCY_ICONS[urgency];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: isDeleting ? 0 : 1,
        x: isDeleting ? 40 : 0,
        scale: isDeleting ? 0.95 : 1,
      }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className={`group relative flex gap-4 overflow-hidden rounded-2xl border border-l-4 ${cfg.border} ${cfg.bg} bg-background p-4 shadow-sm transition-shadow hover:shadow-md`}
    >
      {/* Toggle */}
      <button
        type="button"
        onClick={onToggle}
        disabled={isToggling}
        className="mt-0.5 flex-shrink-0 text-muted-foreground transition-colors hover:text-primary focus:outline-none disabled:opacity-50"
        title={reminder.isCompleted ? 'Mark as pending' : 'Mark as done'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {reminder.isCompleted ? (
            <motion.span
              key="checked"
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 26 }}
              className="block"
            >
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </motion.span>
          ) : (
            <motion.span
              key="unchecked"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 26 }}
              className="block"
            >
              <Circle className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`truncate text-sm font-semibold leading-snug transition-all ${
              reminder.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
            }`}
          >
            {reminder.title}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}
          >
            <UrgencyIcon className="h-3 w-3" />
            {cfg.badgeText}
          </span>
        </div>

        {reminder.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{reminder.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              urgency === 'overdue'
                ? 'text-red-600 dark:text-red-400'
                : urgency === 'today'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-muted-foreground'
            }`}
            title={formatFull(reminder.remindAt)}
          >
            <Clock className="h-3 w-3" />
            {formatFull(reminder.remindAt)}
          </span>
          <span className="text-xs text-muted-foreground">
            ({formatRelative(reminder.remindAt)})
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Edit"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/30"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.article>
  );
}

// ─── Date range picker ─────────────────────────────────────────────────────────

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor="dr-from" className="whitespace-nowrap text-xs text-muted-foreground">
          From
        </Label>
        <Input
          id="dr-from"
          type="date"
          value={from}
          onChange={(e) => onChange(e.target.value, to)}
          className="h-8 w-36 cursor-pointer text-xs"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <Label htmlFor="dr-to" className="whitespace-nowrap text-xs text-muted-foreground">
          To
        </Label>
        <Input
          id="dr-to"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onChange(from, e.target.value)}
          className="h-8 w-36 cursor-pointer text-xs"
        />
      </div>
      {(from || to) && (
        <button
          type="button"
          onClick={() => onChange('', '')}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ReminderListView() {
  const queryClient = useQueryClient();

  const [statusTab, setStatusTab] = useState<ReminderStatus>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Fetch all data once; tab filtering is done client-side for instant switching.
  const queryParams = {
    ...(fromDate ? { from: fromDate } : {}),
    ...(toDate ? { to: toDate } : {}),
    limit: 100,
  };

  const { data, isPending, isError } = useQuery({
    queryKey: [...remindersQueryKeys.list(), queryParams],
    queryFn: () => remindersService.list(queryParams),
  });

  const allData = data?.data ?? [];
  const reminders = allData.filter((r) => {
    if (statusTab === 'pending') return !r.isCompleted;
    if (statusTab === 'completed') return r.isCompleted;
    return true;
  });

  const createMutation = useMutation({
    mutationFn: remindersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: remindersQueryKeys.all });
      toast.success('Reminder created');
    },
    onError: () => toast.error('Could not create reminder'),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof remindersService.update>[1];
    }) => remindersService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: remindersQueryKeys.all });
    },
    onError: () => toast.error('Could not update reminder'),
  });

  const deleteMutation = useMutation({
    mutationFn: remindersService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: remindersQueryKeys.all });
      toast.success('Reminder deleted');
    },
    onError: () => toast.error('Could not delete reminder'),
  });

  const openCreate = () => {
    setEditingReminder(null);
    setModalOpen(true);
  };

  const openEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingReminder(null);
  };

  const handleSave = async (formData: CreateReminderSchema) => {
    const payload = { ...formData, remindAt: toISOString(formData.remindAt) };

    if (editingReminder) {
      await updateMutation.mutateAsync({ id: editingReminder.id, payload });
      toast.success('Reminder updated');
    } else {
      await createMutation.mutateAsync(payload);
    }

    closeModal();
  };

  const handleToggle = async (reminder: Reminder) => {
    setTogglingIds((s) => new Set([...s, reminder.id]));
    try {
      await updateMutation.mutateAsync({
        id: reminder.id,
        payload: { isCompleted: !reminder.isCompleted },
      });
      toast.success(reminder.isCompleted ? 'Marked as pending' : 'Marked as done', {
        icon: reminder.isCompleted ? '🔔' : '✅',
      });
    } finally {
      setTogglingIds((s) => {
        const next = new Set(s);
        next.delete(reminder.id);
        return next;
      });
    }
  };

  const handleDelete = (id: string) => {
    setDeletingIds((s) => new Set([...s, id]));
    window.setTimeout(async () => {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        // error toast handled in mutation
      } finally {
        setDeletingIds((s) => {
          const next = new Set(s);
          next.delete(id);
          return next;
        });
      }
    }, 250);
  };

  return (
    <>
      <div className="space-y-5">
        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-center gap-4 rounded-2xl border bg-background p-4 shadow-sm"
        >
          <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as ReminderStatus)}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="px-4">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="px-4">
                Pending
              </TabsTrigger>
              <TabsTrigger value="completed" className="px-4">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="ml-auto">
            <DateRangePicker
              from={fromDate}
              to={toDate}
              onChange={(f, t) => {
                setFromDate(f);
                setToDate(t);
              }}
            />
          </div>
        </motion.div>

        {/* Loading skeleton */}
        {isPending && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
              >
                <ShimmerCard lineCount={3} showAvatar delay={i * 0.06} className="h-[120px]" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800/40 dark:bg-red-950/20"
          >
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Failed to load reminders
            </p>
            <p className="mt-1 text-xs text-red-400">Check your connection and try again.</p>
          </motion.div>
        )}

        {/* Reminder list */}
        {!isPending && !isError && (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {reminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onToggle={() => handleToggle(reminder)}
                  onEdit={() => openEdit(reminder)}
                  onDelete={() => handleDelete(reminder.id)}
                  isToggling={togglingIds.has(reminder.id)}
                  isDeleting={deletingIds.has(reminder.id)}
                />
              ))}
            </AnimatePresence>

            {/* Empty state */}
            {reminders.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-dashed p-10 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  {statusTab === 'completed' ? (
                    <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <Bell className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-base font-medium">
                  {statusTab === 'completed'
                    ? 'No completed reminders'
                    : statusTab === 'pending'
                      ? 'No pending reminders'
                      : 'No reminders yet'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {statusTab === 'completed'
                    ? 'Complete some reminders to see them here.'
                    : 'Hit the + button to create your first reminder.'}
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-30">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <Button
          type="button"
          size="icon"
          onClick={openCreate}
          className="relative h-14 w-14 rounded-full shadow-lg"
          title="Create reminder"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <ReminderFormModal
            editing={editingReminder}
            onClose={closeModal}
            onSave={handleSave}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>
    </>
  );
}
