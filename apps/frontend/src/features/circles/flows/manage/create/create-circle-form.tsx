'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCircleSchema, type CreateCircleSchema } from '../../../shared/domain/circles.schema';
import { useCreateCircle } from './use-create-circle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        <Label className="mb-2 block">Name</Label>
        <Input placeholder="Friends" {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <Label className="mb-2 block">Description</Label>
        <Input placeholder="What this circle is for" {...register('description')} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create circle'}
      </Button>
    </form>
  );
}
