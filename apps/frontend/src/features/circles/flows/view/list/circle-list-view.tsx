'use client';

import { useCircleList } from './use-circle-list';

export function CircleListView() {
  const { data: circles, isPending, isError } = useCircleList();

  if (isPending) return <p className="text-sm text-muted-foreground">Loading circles…</p>;
  if (isError) return <p className="text-sm text-red-500">Failed to load circles.</p>;

  return (
    <ul className="space-y-3">
      {circles.map((circle) => (
        <li key={circle.id} className="rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold">{circle.name}</h3>
          {circle.description && (
            <p className="mt-1 text-sm text-muted-foreground">{circle.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
