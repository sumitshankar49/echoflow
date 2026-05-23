import { PlaylistDetailView } from '@/features/music/flows/view/detail/playlist-detail-view';

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PlaylistDetailView id={id} />;
}
