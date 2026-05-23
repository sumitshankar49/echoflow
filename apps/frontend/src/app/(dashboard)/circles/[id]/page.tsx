import { CircleDetailView } from '@/features/circles/flows/view/detail/circle-detail-view';

export default async function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CircleDetailView id={id} />;
}
