'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCircleSchema, type CreateCircleSchema } from '../../shared/domain/circles.schema';
import { useCreateCircle } from './use-create-circle';

export function CreateCircleForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutateAsync, isPending } = useCreateCircle();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCircleSchema>({
    resolver: zodResolver(createCircleSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    await mutateAsync(data);
    reset();
    onSuccess?.();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          {...register('name')}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          {...register('description')}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? 'Creating…' : 'Create circle'}
      </button>
    </form>
  );
}
