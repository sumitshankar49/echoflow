'use client';

import { toast } from 'sonner';
import { useCreatePlaylist } from './use-create-playlist';
import { PlaylistEditorForm } from '../../../shared/ui/playlist-editor-form';

export function CreatePlaylistForm({
  onSuccess,
  className,
}: {
  onSuccess?: () => void;
  className?: string;
}) {
  const { mutateAsync, isPending } = useCreatePlaylist();

  return (
    <PlaylistEditorForm
      title="Create a premium playlist"
      description="Capture the vibe, drop in YouTube or local audio sources, and shape a calm listening lane for your next work block."
      submitLabel={isPending ? 'Creating…' : 'Create playlist'}
      isPending={isPending}
      resetOnSuccess
      className={className}
      onSubmit={async (payload) => {
        try {
          await mutateAsync(payload);
          toast.success('Playlist created');
          onSuccess?.();
        } catch {
          toast.error('Unable to create playlist');
        }
      }}
    />
  );
}
