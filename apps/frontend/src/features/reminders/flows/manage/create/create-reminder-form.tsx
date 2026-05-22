'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReminderSchema, type CreateReminderSchema } from '../../../shared/domain/reminders.schema';
import { useCreateReminder } from './use-create-reminder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        <Label className="mb-2 block">Title</Label>
        <Input placeholder="Doctor appointment" {...register('title')} />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>
      <div>
        <Label className="mb-2 block">Description</Label>
        <Input placeholder="Bring reports" {...register('description')} />
      </div>
      <div>
        <Label className="mb-2 block">Due date & time</Label>
        <Input
          type="datetime-local"
          {...register('dueAt')}
        />
        {errors.dueAt && <p className="mt-1 text-xs text-red-500">{errors.dueAt.message}</p>}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : 'Create reminder'}
      </Button>
    </form>
  );
}
