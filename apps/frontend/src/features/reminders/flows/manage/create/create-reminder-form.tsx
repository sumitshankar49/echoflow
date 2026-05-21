'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReminderSchema, type CreateReminderSchema } from '../../shared/domain/reminders.schema';
import { useCreateReminder } from './use-create-reminder';

export function CreateReminderForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutateAsync, isPending } = useCreateReminder();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateReminderSchema>({
    resolver: zodResolver(createReminderSchema),
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
        <input className="w-full rounded-lg border px-3 py-2 text-sm" {...register('title')} />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <input className="w-full rounded-lg border px-3 py-2 text-sm" {...register('description')} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Due date & time</label>
        <input
          type="datetime-local"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          {...register('dueAt')}
        />
        {errors.dueAt && <p className="mt-1 text-xs text-red-500">{errors.dueAt.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Create reminder'}
      </button>
    </form>
  );
}
