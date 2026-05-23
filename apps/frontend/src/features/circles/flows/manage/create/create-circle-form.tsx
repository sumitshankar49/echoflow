'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import { createCircleSchema, type CreateCircleSchema } from '../../../shared/domain/circles.schema';
import { useCreateCircle } from './use-create-circle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function CreateCircleForm({
  onSuccess,
  className,
}: {
  onSuccess?: () => void;
  className?: string;
}) {
  const { mutateAsync, isPending } = useCreateCircle();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCircleSchema>({
    resolver: zodResolver(createCircleSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await mutateAsync(data);
      toast.success('Circle created successfully');
      reset();
      onSuccess?.();
    } catch {
      toast.error('Could not create circle');
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'rounded-[2rem] border border-white/10 bg-slate-950/85 p-5 text-white shadow-[0_20px_65px_-38px_rgba(15,23,42,0.9)] backdrop-blur-xl',
        className,
      )}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-emerald-100/75">
        <Sparkles className="h-3.5 w-3.5" />
        Circle Studio
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">Create a collaborative circle</h2>
      <p className="mt-2 text-sm leading-6 text-white/65">
        Build a warm space for family plans, team updates, and shared momentum.
      </p>

      <div className="mt-5 space-y-4">
      <div>
        <Label className="mb-2 block text-white/85">Circle name</Label>
        <Input
          placeholder="Family Harmony"
          {...register('name')}
          className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
        />
        {errors.name && <p className="mt-1 text-xs text-rose-300">{errors.name.message}</p>}
      </div>
      <div>
        <Label className="mb-2 block text-white/85">Purpose</Label>
        <Input
          placeholder="Weekly family check-ins and shared reminders"
          {...register('description')}
          className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
        />
      </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65">
          <UsersRound className="h-3.5 w-3.5" />
          Invite members right after creation
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-white px-5 text-slate-950 hover:bg-emerald-50"
        >
          {isPending ? 'Creating…' : 'Create circle'}
        </Button>
      </div>
    </form>
  );
}
