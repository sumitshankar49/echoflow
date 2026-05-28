'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, Sparkles, Users, UsersRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ShimmerCard } from '@/components/common/ShimmerCard';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { usersService } from '@/features/users/shared/data/users.service';
import { usersQueryKeys } from '@/features/users/shared/data/users.query-keys';
import { CreateCircleForm } from '../../manage/create/create-circle-form';
import { useCircleList } from './use-circle-list';

const gradients = [
  'from-rose-500/80 via-orange-400/70 to-amber-300/65',
  'from-teal-500/80 via-emerald-400/70 to-cyan-300/70',
  'from-sky-600/80 via-indigo-500/75 to-cyan-300/70',
  'from-fuchsia-500/75 via-rose-400/70 to-orange-300/70',
  'from-slate-900 via-indigo-700/80 to-teal-400/70',
];

function gradientFor(value: string) {
  const hash = Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

function initials(name: string) {
  const values = name.trim().split(/\s+/).filter(Boolean);
  if (!values.length) {
    return 'CC';
  }
  return values.slice(0, 2).map((value) => value[0]?.toUpperCase() ?? '').join('');
}

export function CircleListView() {
  const { data: circles, isPending, isFetching, isError } = useCircleList();
  const [showEntryLoader, setShowEntryLoader] = useState(true);
  const { data: me } = useQuery({ queryKey: usersQueryKeys.me(), queryFn: usersService.getMe });
  const circleItems = Array.isArray(circles) ? circles : [];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowEntryLoader(false);
    }, 450);

    return () => window.clearTimeout(timer);
  }, []);

  const showLoading = showEntryLoader || isPending || (isFetching && circleItems.length === 0);

  if (showLoading)
    return (
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={index}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.07 }}
            >
              <ShimmerCard lineCount={4} showAvatar delay={index * 0.04} className="h-[240px]" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  if (isError) return <p className="text-sm text-red-500">Failed to load circles.</p>;

  return (
    <div className="relative mx-auto w-full max-w-[1400px] space-y-8 pb-10">
      <div className="absolute inset-x-0 top-0 -z-10 h-[25rem] rounded-[2.6rem] bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.25),transparent_30%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.2),transparent_35%),linear-gradient(140deg,rgba(17,24,39,0.97),rgba(30,41,59,0.9),rgba(15,118,110,0.75))]" />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_410px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 text-white shadow-[0_25px_80px_-44px_rgba(15,23,42,0.8)] backdrop-blur-xl sm:p-8"
        >
          <div className="absolute -left-14 top-12 h-40 w-40 rounded-full bg-rose-300/25 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />

          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/20 bg-rose-200/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-rose-100/80">
              <HeartHandshake className="h-3.5 w-3.5" />
              Collaborative Circles
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl 2xl:text-5xl">
                Shared spaces for families and teams to stay close, aligned, and warm.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                Organize circles around real relationships, invite people in seconds, and keep everyone synced with shared notes and visible activity.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Your circles</p>
                <p className="mt-2 text-3xl font-semibold">{circleItems.length}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Members</p>
                <p className="mt-2 text-3xl font-semibold">
                  {circleItems.reduce((total, circle) => total + Math.max(circle.members?.length ?? 0, 1), 0)}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Your role</p>
                <p className="mt-2 text-xl font-semibold">{circleItems.some((circle) => circle.ownerId === me?.id) ? 'Owner' : 'Member'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <CreateCircleForm className="self-start" />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Circle list</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Social-style spaces with member presence</h2>
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Fully responsive collaborative layout
          </Badge>
        </div>

        {circleItems.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border/80 bg-background/70 p-12 text-center shadow-sm backdrop-blur">
            <p className="text-lg font-medium">No circles yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first family or team circle and invite members to start sharing.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {circleItems.map((circle, index) => {
              const members = circle.members?.filter((member) => member.status === 'accepted') ?? [];
              const invitees = circle.members?.filter((member) => member.status === 'invited') ?? [];
              const role = circle.ownerId === me?.id ? 'Owner' : 'Member';
              const memberCount = members.length;
              const avatarNames = members.length
                ? members.map((member) => member.user?.name || `User ${member.userId.slice(0, 4)}`)
                : [circle.name];

              return (
                <motion.article
                  key={circle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="group overflow-hidden rounded-[1.8rem] border border-border/70 bg-card/75 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_26px_60px_-34px_rgba(20,184,166,0.35)]"
                >
                  <div className={cn('relative p-5 text-white', `bg-gradient-to-br ${gradientFor(circle.id)}`)}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/30" />
                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/65">Circle</p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-tight">{circle.name}</h3>
                      </div>
                      <Badge className="rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white">
                        {role}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {circle.description || 'A shared space for updates, notes, and collaborative decisions.'}
                    </p>

                    <div className="flex items-center justify-between gap-3">
                      <AvatarGroup>
                        {avatarNames.slice(0, 4).map((name, avatarIndex) => (
                          <Avatar key={`${circle.id}-${name}-${avatarIndex}`}>
                            <AvatarFallback>{initials(name)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {memberCount > 4 ? <AvatarGroupCount>+{memberCount - 4}</AvatarGroupCount> : null}
                      </AvatarGroup>

                      <div className="text-right text-xs text-muted-foreground">
                        <p className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {memberCount} member{memberCount === 1 ? '' : 's'}
                        </p>
                        {invitees.length ? <p className="mt-1">{invitees.length} pending invite(s)</p> : null}
                      </div>
                    </div>

                    <Link
                      href={`/circles/${circle.id}`}
                      className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-between rounded-full border border-border/70 bg-background/60')}
                    >
                      Open circle
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
