'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Disc3, Link2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createPlaylistSchema, type CreatePlaylistSchema } from '../domain/music.schema';
import {
  extractPlaylistMood,
  moodSuggestions,
  sanitizePlaylistPayload,
  stripMoodMetadata,
  type PlaylistMood,
} from '../domain/music.utils';

interface PlaylistEditorFormProps {
  title: string;
  description: string;
  submitLabel: string;
  isPending?: boolean;
  initialValues?: Partial<CreatePlaylistSchema>;
  className?: string;
  resetOnSuccess?: boolean;
  onCancel?: () => void;
  onSubmit: (values: ReturnType<typeof sanitizePlaylistPayload>) => Promise<void> | void;
}

function getDefaultValues(initialValues?: Partial<CreatePlaylistSchema>): CreatePlaylistSchema {
  return {
    name: initialValues?.name ?? '',
    description: stripMoodMetadata(initialValues?.description) ?? '',
    mood: initialValues?.mood ?? extractPlaylistMood(initialValues?.description) ?? undefined,
    urls: initialValues?.urls?.length ? initialValues.urls : [''],
  };
}

export function PlaylistEditorForm({
  title,
  description,
  submitLabel,
  isPending,
  initialValues,
  className,
  resetOnSuccess,
  onCancel,
  onSubmit,
}: PlaylistEditorFormProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<CreatePlaylistSchema>({
    resolver: zodResolver(createPlaylistSchema),
    defaultValues: getDefaultValues(initialValues),
  });

  const urls = watch('urls');
  const selectedMood = watch('mood');
  useEffect(() => {
    reset(getDefaultValues(initialValues));
  }, [initialValues?.description, initialValues?.mood, initialValues?.name, initialValues?.urls?.join('|'), reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(sanitizePlaylistPayload(values));

    if (resetOnSuccess) {
      reset(getDefaultValues());
    }
  });

  return (
    <form
      onSubmit={submit}
      className={cn(
        'rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 text-white shadow-[0_20px_65px_-35px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:p-6',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs uppercase tracking-[0.32em] text-cyan-100/80">
            <Disc3 className="h-3.5 w-3.5" />
            FocusFlow Studio
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">{description}</p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
          {urls.length} slots ready
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label className="text-white/85">Playlist name</Label>
          <Input
            placeholder="Moonlit Focus"
            {...register('name')}
            className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
          />
          {errors.name ? <p className="text-xs text-rose-300">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label className="text-white/85">Mood suggestion</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {moodSuggestions.map((mood) => {
              const isActive = selectedMood === mood.value;

              return (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() =>
                    setValue('mood', mood.value as PlaylistMood, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={cn(
                    'rounded-2xl border px-3 py-2 text-left transition',
                    isActive
                      ? 'border-cyan-200/50 bg-cyan-300/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">Mood</p>
                  <p className="mt-1 text-sm font-semibold">{mood.title}</p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-white/55">This helps filter playlists by mood in the music section.</p>
          {selectedMood ? (
            <button
              type="button"
              className="text-xs text-cyan-200/85 underline-offset-2 hover:underline"
              onClick={() =>
                setValue('mood', undefined, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              Clear mood
            </button>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label className="text-white/85">Mood note</Label>
          <Textarea
            rows={3}
            placeholder="A warm mix for quiet mornings, soft rain, and long planning blocks."
            {...register('description')}
            className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
          />
          {errors.description ? <p className="text-xs text-rose-300">{errors.description.message}</p> : null}
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-white/85">Tracks and sources</h3>
            <p className="mt-1 text-xs leading-5 text-white/55">
              Add YouTube video links or a YouTube playlist link to auto-import all songs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-rose-200/30 bg-rose-300/10 text-rose-100 hover:bg-rose-300/20"
              onClick={() =>
                setValue('urls', [...urls, 'https://www.youtube.com/watch?v='], {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <Link2 className="h-4 w-4" />
              Add from YouTube
            </Button>

            <Button
              type="button"
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => setValue('urls', [...urls, ''], { shouldDirty: true, shouldValidate: true })}
            >
              <Plus className="h-4 w-4" />
              Add song
            </Button>
          </div>
        </div>

        <div className="mt-4 max-h-[300px] space-y-3 overflow-y-auto pr-1">
          {urls.map((_, index) => (
            <div key={`track-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/30 to-emerald-300/20 text-cyan-100">
                  <Link2 className="h-4 w-4" />
                </div>

                <div className="flex-1 space-y-2">
                  <Label className="text-xs uppercase tracking-[0.2em] text-white/45">Source {index + 1}</Label>
                  <Input
                    placeholder={index === 0 ? 'https://www.youtube.com/watch?v=... or ...&list=PLAYLIST_ID' : 'Paste another YouTube source'}
                    {...register(`urls.${index}`)}
                    className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
                  />
                  {errors.urls?.[index] ? (
                    <p className="text-xs text-rose-300">{errors.urls[index]?.message}</p>
                  ) : null}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-5 rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                  onClick={() =>
                    setValue(
                      'urls',
                      urls.filter((__, currentIndex) => currentIndex !== index),
                      { shouldDirty: true, shouldValidate: true },
                    )
                  }
                  disabled={urls.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isPending || isSubmitting}
          className="rounded-full bg-white px-5 text-slate-950 shadow-[0_10px_35px_-18px_rgba(255,255,255,0.85)] hover:bg-cyan-50"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}