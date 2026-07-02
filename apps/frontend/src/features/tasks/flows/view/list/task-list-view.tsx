'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CheckSquare2,
  Clock3,
  Filter,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { ConfirmActionDialog } from '@/components/common/confirm-action-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/shared/utils/use-debounced-value';

import { tasksQueryKeys } from '@/features/tasks/shared/data/tasks.query-keys';
import { tasksService } from '@/features/tasks/shared/data/tasks.service';
import type { CreateTaskPayload, Task, TaskPriority, UpdateTaskPayload } from '@/features/tasks/shared/domain/tasks.types';

type ViewMode = 'board' | 'list';
type StatusFilter = 'all' | 'active' | 'overdue' | 'completed';
type PriorityFilter = 'all' | TaskPriority;
type BoardLane = 'overdue' | 'today' | 'upcoming' | 'completed';

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const statusFilters: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
];

const priorityFilters: Array<{ key: PriorityFilter; label: string }> = [
  { key: 'all', label: 'All priorities' },
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
];

const boardLanes: Array<{ key: BoardLane; label: string; description: string }> = [
  { key: 'overdue', label: 'Due now', description: 'Tasks that need immediate attention.' },
  { key: 'today', label: 'Today', description: 'Everything scheduled for the current day.' },
  { key: 'upcoming', label: 'Upcoming', description: 'Future tasks and next steps.' },
  { key: 'completed', label: 'Completed', description: 'Recently wrapped tasks.' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value: string) {
  return new Date(value).toISOString();
}

function stripText(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getTaskDueState(task: Task): BoardLane {
  if (task.isCompleted) {
    return 'completed';
  }

  const dueDate = new Date(task.dueDate).getTime();
  const now = Date.now();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (dueDate <= endOfToday.getTime()) {
    return dueDate < now ? 'overdue' : 'today';
  }

  return 'upcoming';
}

function getDueTone(task: Task) {
  if (task.isCompleted) {
    return 'completed';
  }

  const dueDate = new Date(task.dueDate).getTime();
  const diff = dueDate - Date.now();

  if (diff < 0) {
    return 'overdue';
  }

  if (diff < 24 * 60 * 60 * 1000) {
    return 'today';
  }

  if (diff < 3 * 24 * 60 * 60 * 1000) {
    return 'soon';
  }

  return 'upcoming';
}

function formatDueLabel(task: Task) {
  if (task.isCompleted) {
    return `Completed on ${formatDate(task.updatedAt)}`;
  }

  const tone = getDueTone(task);
  if (tone === 'overdue') {
    return `Overdue since ${formatDate(task.dueDate)}`;
  }

  if (tone === 'today') {
    return `Due today at ${formatDateTime(task.dueDate)}`;
  }

  if (tone === 'soon') {
    return `Due soon: ${formatDateTime(task.dueDate)}`;
  }

  return `Due ${formatDateTime(task.dueDate)}`;
}

function taskSort(a: Task, b: Task) {
  if (a.isCompleted !== b.isCompleted) {
    return Number(a.isCompleted) - Number(b.isCompleted);
  }

  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
}

function TaskCheckbox({
  checked,
  onClick,
  disabled,
}: {
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={checked}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.92 }}
      className={cn(
        'relative grid h-11 w-11 place-items-center rounded-2xl border transition-all',
        checked
          ? 'border-emerald-300 bg-emerald-500 text-white shadow-[0_10px_24px_-16px_rgba(16,185,129,0.8)] dark:border-emerald-700 dark:bg-emerald-600'
          : 'border-border/70 bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground'
      )}
    >
      <motion.span
        initial={false}
        animate={{ scale: checked ? 1 : 0.72, opacity: checked ? 1 : 0.85 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className="grid h-6 w-6 place-items-center rounded-full"
      >
        {checked ? <CheckCircle2 className="h-5 w-5" /> : <span className="h-2.5 w-2.5 rounded-full bg-current" />}
      </motion.span>
    </motion.button>
  );
}

function TaskEditorModal({
  open,
  task,
  isSaving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  task: Task | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setDueDate(toDateTimeLocalValue(task?.dueDate));
    setPriority(task?.priority ?? 'medium');
    setTags((task?.tags ?? []).join(', '));
  }, [open, task]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedDueDate = dueDate.trim();

    if (!trimmedTitle || !trimmedDueDate) {
      toast.error('Please add a title and due date.');
      return;
    }

    const nextPayload = {
      title: trimmedTitle,
      description: trimmedDescription || undefined,
      dueDate: fromDateTimeLocalValue(trimmedDueDate),
      priority,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    } satisfies CreateTaskPayload | UpdateTaskPayload;

    await onSubmit(nextPayload);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="w-full max-w-3xl overflow-hidden rounded-[1.9rem] border border-border/70 bg-background shadow-[0_30px_90px_-30px_rgba(15,23,42,0.6)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94),rgba(15,118,110,0.82))] px-5 py-5 text-white sm:px-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.2),transparent_30%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/75 backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                    {task ? 'Edit task' : 'New task'}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {task ? 'Refine the task details' : 'Add a task to your flow'}
                  </h2>
                  <p className="mt-1 max-w-xl text-sm text-white/70">
                    Keep the title short, add a crisp due date, and use tags to make search feel effortless later.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white hover:bg-white/10 hover:text-white"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <form onSubmit={submit} className="max-h-[78vh] overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.85fr)]">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Title</Label>
                    <Input
                      id="task-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Ship the quarterly planning deck"
                      className="h-11 rounded-2xl"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Add context, acceptance criteria, or a quick checklist."
                      className="min-h-40 rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-tags">Tags</Label>
                    <Input
                      id="task-tags"
                      value={tags}
                      onChange={(event) => setTags(event.target.value)}
                      placeholder="work, planning, personal"
                      className="h-11 rounded-2xl"
                    />
                    <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
                  </div>
                </div>

                <div className="space-y-5 rounded-[1.6rem] border border-border/70 bg-muted/25 p-4 sm:p-5">
                  <div className="space-y-2">
                    <Label htmlFor="task-due">Due date</Label>
                    <Input
                      id="task-due"
                      type="datetime-local"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                      className="h-11 rounded-2xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                      <SelectTrigger className="h-11 w-full rounded-2xl">
                        <SelectValue placeholder="Choose priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low priority</SelectItem>
                        <SelectItem value="medium">Medium priority</SelectItem>
                        <SelectItem value="high">High priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Form tips</p>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-start gap-2">
                        <Clock3 className="mt-0.5 h-4 w-4 text-amber-500" />
                        Use a near-term due date to surface the task in the urgent lane.
                      </li>
                      <li className="flex items-start gap-2">
                        <Filter className="mt-0.5 h-4 w-4 text-emerald-500" />
                        Priority and tags make filtering much faster later.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <Button type="button" variant="outline" className="rounded-full sm:px-5" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full sm:px-5" disabled={isSaving}>
                  {isSaving ? 'Saving...' : task ? 'Save changes' : 'Create task'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function TaskCard({
  task,
  onEdit,
  onToggleComplete,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const dueTone = getDueTone(task);
  const dueState = getTaskDueState(task);
  const overdue = dueTone === 'overdue';

  return (
    <motion.article
      layout
      whileHover={{ y: -3, scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={cn(
        'group relative overflow-hidden rounded-[1.7rem] border p-4 shadow-[0_10px_34px_-24px_rgba(15,23,42,0.4)] backdrop-blur-sm transition-colors',
        task.isCompleted
          ? 'border-emerald-300/60 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/25'
          : overdue
            ? 'border-rose-300/70 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20'
            : dueTone === 'today'
              ? 'border-amber-300/70 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20'
              : 'border-border/70 bg-background/90'
      )}
    >
      <div className="flex items-start gap-3">
        <TaskCheckbox checked={task.isCompleted} onClick={() => onToggleComplete(task)} />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={cn(
                    'max-w-full text-base font-semibold tracking-tight text-foreground sm:text-[1.05rem]',
                    task.isCompleted && 'text-muted-foreground line-through decoration-2'
                  )}
                >
                  {task.title}
                </h3>
                <Badge className={cn('rounded-full border-0 capitalize', priorityStyles[task.priority])}>
                  {priorityLabels[task.priority]} priority
                </Badge>
                {dueState === 'completed' ? (
                  <Badge variant="outline" className="rounded-full border-emerald-300/70 text-emerald-700 dark:border-emerald-900/70 dark:text-emerald-200">
                    Completed
                  </Badge>
                ) : overdue ? (
                  <Badge variant="destructive" className="rounded-full">
                    Overdue
                  </Badge>
                ) : dueTone === 'today' ? (
                  <Badge className="rounded-full border-0 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                    Due today
                  </Badge>
                ) : dueTone === 'soon' ? (
                  <Badge className="rounded-full border-0 bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                    Due soon
                  </Badge>
                ) : null}
              </div>

              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {task.description ? stripText(task.description) : 'No description yet.'}
              </p>
            </div>

            <div className="flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => onEdit(task)} aria-label="Edit task">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => onDelete(task)} aria-label="Delete task">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium', overdue ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200' : 'bg-muted/80')}>
              {overdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}
              {formatDueLabel(task)}
            </span>

            {task.tags.length > 0 ? (
              task.tags.slice(0, 4).map((tag) => (
                <span key={`${task.id}-${tag}`} className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-1 font-medium">
                  <Tag className="h-3.5 w-3.5" />
                  {tag}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-1 font-medium">No tags</span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function LaneColumn({
  label,
  description,
  tasks,
  accent,
  onEdit,
  onToggleComplete,
  onDelete,
}: {
  label: string;
  description: string;
  tasks: Task[];
  accent: string;
  onEdit: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-[1.8rem] border border-border/70 bg-background/85 p-4 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.45)]">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight">{label}</h3>
          <Badge className={cn('rounded-full border-0', accent)}>{tasks.length}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
            No tasks here yet.
          </div>
        )}
      </div>
    </div>
  );
}

export function TaskListView() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const debouncedQuery = useDebouncedValue(query, 250);

  const { data: tasks = [], isPending, isError, isFetching } = useQuery({
    queryKey: tasksQueryKeys.list(),
    queryFn: tasksService.list,
  });

  const createMutation = useMutation({
    mutationFn: tasksService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.all });
      toast.success('Task created');
    },
    onError: () => toast.error('Could not create task'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) => tasksService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.all });
      toast.success('Task updated');
    },
    onError: () => toast.error('Could not update task'),
  });

  const deleteMutation = useMutation({
    mutationFn: tasksService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.all });
      toast.success('Task deleted');
    },
    onError: () => toast.error('Could not delete task'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      tasksService.update(id, { isCompleted }),
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKeys.list() });

      const previousTasks = queryClient.getQueryData<Task[]>(tasksQueryKeys.list()) ?? [];

      queryClient.setQueryData<Task[]>(
        tasksQueryKeys.list(),
        previousTasks.map((task) => (task.id === id ? { ...task, isCompleted } : task))
      );

      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(tasksQueryKeys.list(), context.previousTasks);
      }

      toast.error('Could not update task status');
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.all });
    },
  });

  const selectedTask = useMemo(
    () => (editingTaskId ? tasks.find((task) => task.id === editingTaskId) ?? null : null),
    [editingTaskId, tasks]
  );

  const filteredTasks = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    return tasks
      .filter((task) => {
        if (statusFilter === 'completed' && !task.isCompleted) {
          return false;
        }

        if (statusFilter === 'active' && task.isCompleted) {
          return false;
        }

        if (statusFilter === 'overdue' && getDueTone(task) !== 'overdue') {
          return false;
        }

        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = [task.title, task.description ?? '', ...task.tags].join(' ').toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort(taskSort);
  }, [debouncedQuery, priorityFilter, statusFilter, tasks]);

  const stats = useMemo(() => {
    const overdue = tasks.filter((task) => !task.isCompleted && getDueTone(task) === 'overdue').length;
    const completed = tasks.filter((task) => task.isCompleted).length;
    const urgent = tasks.filter((task) => !task.isCompleted && (getDueTone(task) === 'overdue' || getDueTone(task) === 'today')).length;

    return {
      total: tasks.length,
      completed,
      overdue,
      urgent,
    };
  }, [tasks]);

  const boardColumns = useMemo(() => {
    const grouped: Record<BoardLane, Task[]> = {
      overdue: [],
      today: [],
      upcoming: [],
      completed: [],
    };

    filteredTasks.forEach((task) => {
      grouped[getTaskDueState(task)].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  const openCreateModal = () => {
    setEditingTaskId(null);
    setEditorOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingTaskId(null);
  };

  const handleSubmitTask = async (payload: CreateTaskPayload | UpdateTaskPayload) => {
    if (editingTaskId) {
      await updateMutation.mutateAsync({ id: editingTaskId, payload });
    } else {
      await createMutation.mutateAsync(payload as CreateTaskPayload);
    }

    closeEditor();
  };

  const handleToggle = async (task: Task) => {
    await toggleMutation.mutateAsync({ id: task.id, isCompleted: !task.isCompleted });
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) {
      return;
    }

    const taskId = taskToDelete.id;
    setTaskToDelete(null);

    await deleteMutation.mutateAsync(taskId);
  };

  if (isError) {
    return <p className="text-sm text-red-500">Failed to load tasks.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,rgba(15,23,42,0.97),rgba(30,41,59,0.92),rgba(20,184,166,0.75))] p-5 text-white shadow-[0_30px_90px_-50px_rgba(15,23,42,0.95)] sm:p-6">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/75 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" /> Task control center
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Tasks</h1>
              <p className="mt-1 max-w-2xl text-sm text-white/70">
                Plan the day in a clean board or list view, keep priorities visible, and catch overdue work before it slips.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-2xl border border-white/10 bg-white/10 p-1 backdrop-blur">
                <Button type="button" size="sm" variant={viewMode === 'board' ? 'default' : 'ghost'} onClick={() => setViewMode('board')} className="gap-1 rounded-xl">
                  <LayoutGrid className="h-4 w-4" /> Board
                </Button>
                <Button type="button" size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'} onClick={() => setViewMode('list')} className="gap-1 rounded-xl">
                  <List className="h-4 w-4" /> List
                </Button>
              </div>

              <Button type="button" className="gap-2 rounded-full bg-white text-slate-950 hover:bg-white/90" onClick={openCreateModal}>
                <Plus className="h-4 w-4" /> New task
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-white/60">Total tasks</p>
              <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-white/60">Completed</p>
              <p className="mt-1 text-2xl font-semibold">{stats.completed}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-white/60">Urgent</p>
              <p className="mt-1 text-2xl font-semibold">{stats.urgent}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-white/60">Overdue</p>
              <p className="mt-1 text-2xl font-semibold">{stats.overdue}</p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tasks, descriptions, or tags..."
                className="h-11 rounded-2xl border-white/10 bg-white/10 pl-9 text-white placeholder:text-white/40"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
              <Clock3 className="h-3.5 w-3.5" />
              {isFetching ? 'Syncing tasks...' : `${filteredTasks.length} tasks shown`}
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.key}
                  type="button"
                  size="sm"
                  variant={statusFilter === filter.key ? 'default' : 'ghost'}
                  onClick={() => setStatusFilter(filter.key)}
                  className="rounded-full"
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {priorityFilters.map((filter) => (
                <Button
                  key={filter.key}
                  type="button"
                  size="sm"
                  variant={priorityFilter === filter.key ? 'default' : 'ghost'}
                  onClick={() => setPriorityFilter(filter.key)}
                  className="rounded-full"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-[1.7rem] border border-border/70 bg-muted/40" />
          ))}
        </div>
      ) : null}

      {!isPending && filteredTasks.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-border/70 bg-background/80 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <CheckSquare2 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">No tasks found</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Try a different filter, clear the search text, or add a fresh task to get the board moving.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button type="button" variant="outline" onClick={() => { setQuery(''); setStatusFilter('all'); setPriorityFilter('all'); }}>
              Clear filters
            </Button>
            <Button type="button" onClick={openCreateModal}>
              <Plus className="h-4 w-4" /> New task
            </Button>
          </div>
        </div>
      ) : null}

      {!isPending && filteredTasks.length > 0 ? (
        viewMode === 'board' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-4 xl:grid-cols-4"
          >
            {boardLanes.map((lane) => {
              const laneTasks = boardColumns[lane.key];
              const laneAccent =
                lane.key === 'overdue'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                  : lane.key === 'today'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                    : lane.key === 'upcoming'
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200';

              return (
                <LaneColumn
                  key={lane.key}
                  label={lane.label}
                  description={lane.description}
                  tasks={laneTasks}
                  accent={laneAccent}
                  onEdit={openEditModal}
                  onToggleComplete={handleToggle}
                  onDelete={handleDelete}
                />
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={openEditModal} onToggleComplete={handleToggle} onDelete={handleDelete} />
            ))}
          </motion.div>
        )
      ) : null}

      <TaskEditorModal
        open={editorOpen}
        task={selectedTask}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onClose={closeEditor}
        onSubmit={handleSubmitTask}
      />

      <ConfirmActionDialog
        open={Boolean(taskToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setTaskToDelete(null);
          }
        }}
        title="Delete task"
        description={taskToDelete ? `Delete \"${taskToDelete.title}\"? This action cannot be undone.` : 'Delete this task?'}
        confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}