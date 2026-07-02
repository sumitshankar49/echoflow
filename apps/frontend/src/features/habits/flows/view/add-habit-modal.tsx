'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCreateHabit } from './use-habits';
import type { CreateHabitPayload, HabitFrequency } from '../../shared/domain/habits.types';

const PRESET_COLORS = [
  '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#db2777', '#7c3aed',
];

const PRESET_ICONS = [
  '🧘', '🏃', '💧', '📚', '🥗', '💪', '🌙', '✍️',
  '🎯', '🧠', '🌿', '⚡', '🎨', '🎵', '🙏', '❤️',
];

interface FormValues {
  name: string;
  description: string;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
}

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddHabitModal({ open, onClose }: AddHabitModalProps) {
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);
  const { mutateAsync: createHabit, isPending } = useCreateHabit();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', description: '', frequency: 'daily', targetDaysPerWeek: 7 },
  });

  const frequency = watch('frequency');

  async function onSubmit(values: FormValues) {
    const payload: CreateHabitPayload = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      color: selectedColor,
      icon: selectedIcon,
      frequency: values.frequency,
      targetDaysPerWeek: values.frequency === 'daily' ? 7 : values.targetDaysPerWeek,
    };
    try {
      await createHabit(payload);
      toast.success(`Habit "${payload.name}" created!`);
      reset();
      setSelectedColor(PRESET_COLORS[0]);
      setSelectedIcon(PRESET_ICONS[0]);
      onClose();
    } catch {
      toast.error('Failed to create habit');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl border border-white/10 bg-slate-950 pb-safe sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div>
                <h2 className="font-bold text-white">New Habit</h2>
                <p className="text-xs text-white/40">Build something great, one day at a time</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5">
              {/* Icon + colour preview */}
              <div className="mb-5 flex items-center gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-lg"
                  style={{ backgroundColor: `${selectedColor}33`, border: `2px solid ${selectedColor}55` }}
                >
                  {selectedIcon}
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    {...register('name', { required: 'Name is required', maxLength: 100 })}
                    placeholder="Habit name…"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white placeholder:text-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Why does this matter to you? (optional)"
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                />
              </div>

              {/* Icon picker */}
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/30">Icon</p>
              <div className="mb-4 grid grid-cols-8 gap-1.5">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl text-lg transition',
                      selectedIcon === icon
                        ? 'bg-white/15 ring-1 ring-white/30'
                        : 'hover:bg-white/8',
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {/* Color picker */}
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/30">Colour</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={cn(
                      'h-7 w-7 rounded-full transition-transform',
                      selectedColor === c ? 'scale-125 ring-2 ring-white/60' : 'hover:scale-110',
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Frequency */}
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/30">Frequency</p>
              <div className="mb-4 flex gap-2">
                {(['daily', 'weekly'] as const).map((f) => (
                  <label
                    key={f}
                    className={cn(
                      'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition',
                      frequency === f
                        ? 'border-violet-500/50 bg-violet-500/15 text-violet-300'
                        : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/8 hover:text-white/80',
                    )}
                  >
                    <input type="radio" {...register('frequency')} value={f} className="sr-only" />
                    {f === 'daily' ? '📅 Daily' : '🗓️ Weekly'}
                  </label>
                ))}
              </div>

              {frequency === 'weekly' && (
                <div className="mb-4 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <span className="text-sm text-white/60">Target days per week</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <label key={d} className="cursor-pointer">
                        <input
                          type="radio"
                          {...register('targetDaysPerWeek', { valueAsNumber: true })}
                          value={d}
                          className="sr-only"
                        />
                        <span
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition',
                            watch('targetDaysPerWeek') === d
                              ? 'bg-violet-500 text-white'
                              : 'bg-white/8 text-white/50 hover:bg-white/15 hover:text-white',
                          )}
                        >
                          {d}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50"
              >
                {isPending ? 'Creating…' : 'Create Habit'}
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
