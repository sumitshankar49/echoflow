'use client';

import { useCircleDetail } from './use-circle-detail';

export function CircleDetailView({ id }: { id: string }) {
  const { data: circle, isPending, isError } = useCircleDetail(id);

  if (isPending) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (isError) return <p className="text-sm text-red-500">Circle not found.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{circle.name}</h1>
      {circle.description && <p className="text-sm text-muted-foreground">{circle.description}</p>}
    </div>
  );
}
