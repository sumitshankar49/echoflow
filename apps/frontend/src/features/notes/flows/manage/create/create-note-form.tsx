'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNoteSchema, type CreateNoteSchema } from '../../shared/domain/notes.schema';
import { useCreateNote } from './use-create-note';

export function CreateNoteForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutateAsync, isPending } = useCreateNote();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateNoteSchema>({
    resolver: zodResolver(createNoteSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    await mutateAsync(data);
    reset();
    onSuccess?.();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          {...register('title')}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Content</label>
        <textarea
          rows={5}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          {...register('content')}
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Create note'}
      </button>
    </form>
  );
}
