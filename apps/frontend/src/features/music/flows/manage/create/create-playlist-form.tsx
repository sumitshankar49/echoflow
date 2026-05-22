'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPlaylistSchema, type CreatePlaylistSchema } from '../../../shared/domain/music.schema';
import { useCreatePlaylist } from './use-create-playlist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CreatePlaylistForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutateAsync, isPending } = useCreatePlaylist();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreatePlaylistSchema>({
    resolver: zodResolver(createPlaylistSchema),
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
        <Input placeholder="Roadtrip Mix" {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <Label className="mb-2 block">Description</Label>
        <Input placeholder="Your favorite driving tracks" {...register('description')} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create playlist'}
      </Button>
    </form>
  );
}
