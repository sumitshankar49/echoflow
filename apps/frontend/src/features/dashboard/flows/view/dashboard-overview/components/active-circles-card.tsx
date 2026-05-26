import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { initials } from '../shared/dashboard-overview.utils';
import type { DashboardCircle } from '../types';

type ActiveCirclesCardProps = {
  activeCircles: DashboardCircle[];
};

export function ActiveCirclesCard({ activeCircles }: ActiveCirclesCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.14 }}
      className="h-full xl:col-span-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Active circles</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">People in your loop</h2>
        </div>
        <Users className="h-5 w-5 text-rose-500" />
      </div>

      <div className="mt-4 space-y-3">
        {activeCircles.length ? (
          activeCircles.map((circle) => {
            const acceptedMembers = (circle.members ?? []).filter((member) => member.status === 'accepted');
            const fallbackName = circle.name.split(' ')[0] || 'Member';
            const names = acceptedMembers.length
              ? acceptedMembers.map((member) => member.user?.name || fallbackName)
              : [fallbackName, `${fallbackName} Team`];

            return (
              <div key={circle.id} className="rounded-xl border border-border/70 bg-background/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{circle.name}</p>
                  <Badge variant="outline" className="rounded-full text-xs">
                    {Math.max(acceptedMembers.length, 1)} members
                  </Badge>
                </div>
                <div className="mt-2">
                  <AvatarGroup>
                    {names.slice(0, 4).map((name, index) => (
                      <Avatar key={`${circle.id}-${name}-${index}`}>
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {names.length > 4 ? <AvatarGroupCount>+{names.length - 4}</AvatarGroupCount> : null}
                  </AvatarGroup>
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
            No active circles yet.
          </p>
        )}
      </div>
    </motion.article>
  );
}
