'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNoteSchema, type CreateNoteSchema } from '../../../shared/domain/notes.schema';
import { useCreateNote } from './use-create-note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
        <Label className="mb-2 block">Title</Label>
        <Input placeholder="Meeting notes" {...register('title')} />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>
      <div>
        <Label className="mb-2 block">Content</Label>
        <Textarea
          rows={5}
          placeholder="Write your note here..."
          {...register('content')}
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : 'Create note'}
      </Button>
    </form>
  );
}
