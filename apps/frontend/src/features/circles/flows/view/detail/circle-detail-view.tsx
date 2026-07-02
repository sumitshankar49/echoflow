'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import type { AxiosError } from 'axios';
import {
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  Mail,
  MessageSquare,
  Plus,
  Shield,
  Sparkles,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { ConfirmActionDialog } from '@/components/common/confirm-action-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/shared/api/error-message';
import { circlesService } from '../../../shared/data/circles.service';
import { useCircleDetail } from './use-circle-detail';
import { useCircleSharedNotes } from './use-circle-shared-notes';
import { CircleNotePickerDialog } from './circle-note-picker-dialog';
import { circlesQueryKeys } from '../../../shared/data/circles.query-keys';
import { usersQueryKeys } from '@/features/users/shared/data/users.query-keys';
import { usersService } from '@/features/users/shared/data/users.service';
import { notesQueryKeys } from '@/features/notes/shared/data/notes.query-keys';
import { notesService } from '@/features/notes/shared/data/notes.service';

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function initials(name: string) {
  const values = name.trim().split(/\s+/).filter(Boolean);
  if (!values.length) {
    return 'CC';
  }

  return values.slice(0, 2).map((value) => value[0]?.toUpperCase() ?? '').join('');
}

function formatDate(value?: string) {
  if (!value) {
    return 'Just now';
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

const gradients = [
  'from-rose-500/85 via-orange-400/75 to-amber-300/65',
  'from-teal-500/85 via-emerald-400/70 to-cyan-300/70',
  'from-sky-600/85 via-indigo-500/75 to-cyan-300/70',
  'from-fuchsia-500/75 via-rose-400/70 to-orange-300/70',
  'from-slate-900 via-indigo-700/85 to-teal-400/70',
];

function gradientFor(value: string) {
  const hash = Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export function CircleDetailView({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { data: circle, isPending, isError } = useCircleDetail(id);
  const { data: sharedNotes = [] } = useCircleSharedNotes(id);
  const { data: me } = useQuery({ queryKey: usersQueryKeys.me(), queryFn: usersService.getMe });
  const { data: notes = [] } = useQuery({
    queryKey: notesQueryKeys.list(),
    queryFn: notesService.list,
    enabled: Boolean(id),
  });

  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [editableName, setEditableName] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [isDeleteCircleDialogOpen, setIsDeleteCircleDialogOpen] = useState(false);
  const [isNotePickerOpen, setIsNotePickerOpen] = useState(false);

  function getInviteErrorMessage(error: unknown) {
    const maybeAxiosError = error as AxiosError<{ message?: string | string[]; error?: string }>;
    const status = maybeAxiosError?.response?.status;
    const rawMessage = maybeAxiosError?.response?.data?.message;
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;

    if (status === 404 && message?.toLowerCase().includes('email')) {
      return 'No account found for this email yet. Share the invite link so they can join after sign up.';
    }

    return getApiErrorMessage(error, 'Unable to send invitation');
  }

  const inviteMutation = useMutation({
    mutationFn: (email: string) => circlesService.invite(id, { email }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: circlesQueryKeys.detail(id) });

      if (response?.message) {
        toast.info(response.message);
      } else {
        toast.success('Invitation sent');
      }

      setInviteEmail('');
    },
    onError: (error) => {
      toast.error(getInviteErrorMessage(error));
    },
  });

  const acceptMutation = useMutation({
    mutationFn: () => circlesService.acceptInvitation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: circlesQueryKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: circlesQueryKeys.list() });
      toast.success('Invitation accepted');
    },
    onError: () => toast.error('Unable to accept invitation'),
  });

  const declineMutation = useMutation({
    mutationFn: () => circlesService.declineInvitation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: circlesQueryKeys.list() });
      toast.success('Invitation declined');
      window.location.replace('/circles');
    },
    onError: () => toast.error('Unable to decline invitation'),
  });

  const leaveMutation = useMutation({
    mutationFn: () => circlesService.leaveCircle(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: circlesQueryKeys.list() });
      toast.success('You left this circle');
      window.location.replace('/circles');
    },
    onError: () => toast.error('Unable to leave circle'),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => circlesService.removeMember(id, memberId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: circlesQueryKeys.detail(id) });
      toast.success('Member removed');
    },
    onError: () => toast.error('Unable to remove member'),
  });

  const shareNoteMutation = useMutation({
    mutationFn: (noteId: string) => circlesService.shareNote(id, { noteId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: circlesQueryKeys.sharedNotes(id) });
      toast.success('Note shared to circle');
      setIsNotePickerOpen(false);
    },
    onError: () => toast.error('Unable to share note'),
  });

  const unshareNoteMutation = useMutation({
    mutationFn: (noteId: string) => circlesService.unshareNote(id, noteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: circlesQueryKeys.sharedNotes(id) });
      toast.success('Shared note removed');
    },
    onError: () => toast.error('Unable to remove shared note'),
  });

  const updateCircleMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) => circlesService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: circlesQueryKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: circlesQueryKeys.list() });
      toast.success('Circle details updated');
    },
    onError: () => toast.error('Unable to update circle details'),
  });

  const deleteCircleMutation = useMutation({
    mutationFn: () => circlesService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: circlesQueryKeys.list() });
      toast.success('Circle deleted');
      window.location.replace('/circles');
    },
    onError: () => toast.error('Unable to delete circle'),
  });

  const confirmLeaveCircle = async () => {
    await leaveMutation.mutateAsync();
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) {
      return;
    }

    const target = memberToRemove;
    setMemberToRemove(null);
    await removeMutation.mutateAsync(target.id);
  };

  useEffect(() => {
    if (!circle) {
      return;
    }

    setEditableName(circle.name);
    setEditableDescription(circle.description || '');
  }, [circle]);

  const handleSaveCircleDetails = async () => {
    const trimmedName = editableName.trim();

    if (!trimmedName) {
      toast.info('Circle name is required');
      return;
    }

    await updateCircleMutation.mutateAsync({
      name: trimmedName,
      description: editableDescription.trim() || undefined,
    });
  };

  const confirmDeleteCircle = async () => {
    await deleteCircleMutation.mutateAsync();
  };

  if (isPending) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (isError) return <p className="text-sm text-red-500">Circle not found.</p>;

  const members = circle.members ?? [];
  const acceptedMembers = members.filter((member) => member.status === 'accepted');
  const invitedMembers = members.filter((member) => member.status === 'invited');
  const myMembership = members.find((member) => member.userId === me?.id);
  const isOwner = circle.ownerId === me?.id;
  const isInvited = !isOwner && myMembership?.status === 'invited';
  const canCollaborate = isOwner || myMembership?.status === 'accepted';

  const sharedNoteIds = new Set(sharedNotes.map((sharedNote) => sharedNote.noteId));
  const shareableNotes = notes.filter((note) => !sharedNoteIds.has(note.id));

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/circles/${circle.id}?invite=true`
    : `/circles/${circle.id}?invite=true`;

  const activityItems: Array<{ id: string; title: string; subtitle: string; time: string }> = [
    {
      id: `created-${circle.id}`,
      title: `${circle.name} was created`,
      subtitle: 'Circle space is ready for collaboration',
      time: circle.createdAt,
    },
    ...invitedMembers.map((member) => ({
      id: `invite-${member.id}`,
      title: `Invitation sent to ${member.user?.name || member.user?.email || 'member'}`,
      subtitle: 'Pending acceptance',
      time: member.updatedAt || member.createdAt || circle.createdAt,
    })),
    ...acceptedMembers.map((member) => ({
      id: `join-${member.id}`,
      title: `${member.user?.name || 'A member'} joined this circle`,
      subtitle: member.role === 'owner' ? 'Owner is active' : 'Ready to collaborate',
      time: member.updatedAt || member.createdAt || circle.createdAt,
    })),
    ...sharedNotes.map((sharedNote) => ({
      id: `note-${sharedNote.id}`,
      title: `${sharedNote.note.title} was shared`,
      subtitle: `Shared by ${sharedNote.sharedBy?.name || 'a collaborator'}`,
      time: sharedNote.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  return (
    <div className="relative mx-auto w-full max-w-[1400px] space-y-8 pb-12">
      <div className="absolute inset-x-0 top-0 -z-10 h-[24rem] rounded-[2.6rem] bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.24),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.2),transparent_34%),linear-gradient(140deg,rgba(17,24,39,0.97),rgba(30,41,59,0.9),rgba(15,118,110,0.72))]" />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.82)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/circles"
              className={cn(buttonVariants({ variant: 'ghost' }), 'rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to circles
            </Link>
            <Badge className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white">
              {isOwner ? 'Owner view' : 'Member view'}
            </Badge>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className={cn('relative aspect-square overflow-hidden rounded-[1.8rem] bg-gradient-to-br', gradientFor(circle.id))}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/40" />
              <div className="absolute bottom-4 left-4 right-4 rounded-[1.2rem] border border-white/15 bg-black/25 p-3 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Circle</p>
                <p className="mt-1 text-2xl font-semibold">{circle.name}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{circle.name}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
                  {circle.description || 'A warm collaborative space for plans, notes, and shared progress.'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">Members</p>
                  <p className="mt-2 text-3xl font-semibold">{Math.max(acceptedMembers.length, 1)}</p>
                </div>
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">Pending</p>
                  <p className="mt-2 text-3xl font-semibold">{invitedMembers.length}</p>
                </div>
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">Activity</p>
                  <p className="mt-2 text-3xl font-semibold">{activityItems.length}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <AvatarGroup>
                  {(acceptedMembers.length ? acceptedMembers : [{ id: 'owner-fallback', user: me } as any])
                    .slice(0, 4)
                    .map((member) => (
                      <Avatar key={member.id}>
                        <AvatarFallback>{initials(member.user?.name || 'Circle Member')}</AvatarFallback>
                      </Avatar>
                    ))}
                  {acceptedMembers.length > 4 ? <AvatarGroupCount>+{acceptedMembers.length - 4}</AvatarGroupCount> : null}
                </AvatarGroup>

                <Badge variant="outline" className="rounded-full border-white/20 bg-white/5 text-white">
                  <Users className="mr-1.5 h-3.5 w-3.5" />
                  {isOwner ? 'You manage this circle' : 'You are collaborating here'}
                </Badge>
              </div>

              <AnimatePresence>
                {isInvited ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-[1.4rem] border border-emerald-300/35 bg-emerald-300/10 p-4"
                  >
                    <p className="text-sm font-medium text-emerald-100">Invitation pending your response</p>
                    <p className="mt-1 text-sm text-emerald-100/75">Accept to join the circle, or decline to remove this invitation.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() => acceptMutation.mutate()}
                        disabled={acceptMutation.isPending}
                        className="rounded-full bg-white text-emerald-950 hover:bg-emerald-50"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => declineMutation.mutate()}
                        disabled={declineMutation.isPending}
                        className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/85 p-5 text-white shadow-[0_20px_55px_-34px_rgba(15,23,42,0.8)] backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-200/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-teal-100/80">
              <Mail className="h-3.5 w-3.5" />
              Invite flow
            </div>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Invite members beautifully</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Share a direct link or invite by email to bring your family or team together in one circle.
            </p>
            <p className="mt-1 text-xs text-white/55">
              Email invites currently work for existing EchoFlow accounts. For new users, send the invite link.
            </p>

            {isOwner ? (
              <div className="mt-5 space-y-4">
                <div>
                  <Label className="mb-2 block text-white/85">Email</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      placeholder="member@team.com"
                      className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
                    />
                    <Button
                      type="button"
                      onClick={() => inviteMutation.mutate(inviteEmail.trim())}
                      disabled={!inviteEmail.trim() || inviteMutation.isPending}
                      className="h-11 rounded-2xl bg-white px-4 text-slate-950 hover:bg-emerald-50"
                    >
                      Send
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block text-white/85">Invite link</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input value={inviteLink} readOnly className="h-11 rounded-2xl border-white/10 bg-white/5 text-white" />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(inviteLink);
                          setCopied(true);
                          toast.success('Invite link copied');
                          window.setTimeout(() => setCopied(false), 1500);
                        } catch {
                          toast.error('Could not copy link');
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/70">
                  Only owners can invite new members. You can still collaborate and contribute inside this circle.
                </p>
              </div>
            )}

            {!isOwner && myMembership?.status === 'accepted' ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLeaveDialogOpen(true)}
                disabled={leaveMutation.isPending}
                className="mt-4 w-full rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <UserMinus className="h-4 w-4" />
                Leave circle
              </Button>
            ) : null}

            {isOwner ? (
              <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/5 p-4 space-y-3">
                <p className="text-sm font-medium text-white/85">Manage circle</p>

                <div className="space-y-1.5">
                  <Label className="text-white/80">Circle name</Label>
                  <Input
                    value={editableName}
                    onChange={(event) => setEditableName(event.target.value)}
                    className="h-10 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
                    placeholder="Circle name"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/80">Description</Label>
                  <Input
                    value={editableDescription}
                    onChange={(event) => setEditableDescription(event.target.value)}
                    className="h-10 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
                    placeholder="Add a short description"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => void handleSaveCircleDetails()}
                    disabled={updateCircleMutation.isPending}
                    className="rounded-full bg-white text-slate-950 hover:bg-emerald-50"
                  >
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeleteCircleDialogOpen(true)}
                    disabled={deleteCircleMutation.isPending}
                    className="rounded-full border-rose-300/40 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                  >
                    Delete circle
                  </Button>
                </div>
              </div>
            ) : null}

            {canCollaborate ? (
              <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white/85">Share notes to this circle</p>
                    <p className="mt-1 text-xs text-white/60">Open a cleaner picker to search, preview, and share one note at a time.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNotePickerOpen(true)}
                    disabled={!shareableNotes.length}
                    className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                    Open note picker
                  </Button>
                </div>
                {shareableNotes.length ? (
                  <p className="text-sm text-white/65">
                    {shareableNotes.length} note{shareableNotes.length === 1 ? '' : 's'} ready to share.
                  </p>
                ) : (
                  <p className="text-sm text-white/65">All of your current notes are already shared here.</p>
                )}
              </div>
            ) : null}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4 rounded-[1.8rem] border border-border/70 bg-card/75 p-5 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.4)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Members</p>
              <h3 className="mt-2 text-xl font-semibold">Circle roster</h3>
            </div>
            <Badge variant="outline" className="rounded-full">
              {Math.max(acceptedMembers.length, 1)} active
            </Badge>
          </div>

          <div className="space-y-3">
            {(members.length
              ? members
              : [{ id: 'owner-fallback', userId: circle.ownerId, role: 'owner', status: 'accepted', user: me } as any]
            ).map((member) => {
              const isMemberOwner = member.role === 'owner';
              const name = member.user?.name || (isMemberOwner ? 'Circle Owner' : `Member ${member.userId.slice(0, 4)}`);

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-[1.2rem] border border-border/70 bg-background/80 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">{member.user?.email || member.userId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isMemberOwner ? 'default' : 'secondary'}>
                      {member.role === 'owner' ? 'Owner' : member.status === 'invited' ? 'Invited' : 'Member'}
                    </Badge>
                    {isOwner && !isMemberOwner ? (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="rounded-full"
                        onClick={() =>
                          setMemberToRemove({
                            id: member.id,
                            name,
                          })
                        }
                        disabled={removeMutation.isPending}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 rounded-[1.8rem] border border-border/70 bg-card/75 p-5 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.4)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Shared notes</p>
              <h3 className="mt-2 text-xl font-semibold">Real collaborative notes</h3>
            </div>
            <Badge variant="outline" className="rounded-full">
              {sharedNotes.length} shared
            </Badge>
          </div>

          <div className="space-y-3">
            {sharedNotes.length ? (
              sharedNotes.map((sharedNote) => {
                const canRemoveSharedNote = isOwner || sharedNote.sharedByUserId === me?.id;

                return (
                  <div key={sharedNote.id} className="rounded-[1.2rem] border border-border/70 bg-background/80 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{sharedNote.note.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {stripHtml(sharedNote.note.content) || 'No content'}
                        </p>
                      </div>
                      {canRemoveSharedNote ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => unshareNoteMutation.mutate(sharedNote.noteId)}
                          disabled={unshareNoteMutation.isPending}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span>Shared by {sharedNote.sharedBy?.name || 'a collaborator'}</span>
                      <span>•</span>
                      <span>{formatDate(sharedNote.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-border/70 bg-background/80 p-5 text-sm text-muted-foreground">
                No notes have been shared to this circle yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-border/70 bg-card/75 p-5 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.4)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Activity feed</p>
            <h3 className="mt-2 text-xl font-semibold">Latest circle events</h3>
          </div>
          <Badge variant="outline" className="rounded-full">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Live collaboration timeline
          </Badge>
        </div>

        <div className="mt-4 space-y-3">
          {activityItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 p-3"
            >
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                {item.id.startsWith('invite-') ? (
                  <Mail className="h-4 w-4" />
                ) : item.id.startsWith('note-') ? (
                  <MessageSquare className="h-4 w-4" />
                ) : item.id.startsWith('join-') ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                {formatDate(item.time)}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <ConfirmActionDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        title="Leave circle"
        description={`Are you sure you want to leave \"${circle.name}\"? You will lose access to this circle until invited again.`}
        confirmLabel="Leave circle"
        isLoading={leaveMutation.isPending}
        onConfirm={confirmLeaveCircle}
      />

      <ConfirmActionDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToRemove(null);
          }
        }}
        title="Remove member"
        description={
          memberToRemove
            ? `Are you sure you want to remove \"${memberToRemove.name}\" from this circle?`
            : 'Are you sure you want to remove this member from this circle?'
        }
        confirmLabel="Remove member"
        isLoading={removeMutation.isPending}
        onConfirm={confirmRemoveMember}
      />

      <ConfirmActionDialog
        open={isDeleteCircleDialogOpen}
        onOpenChange={setIsDeleteCircleDialogOpen}
        title="Delete circle"
        description={`Are you sure you want to delete \"${circle.name}\"? This action cannot be undone and all memberships in this circle will be removed.`}
        confirmLabel="Delete circle"
        isLoading={deleteCircleMutation.isPending}
        onConfirm={confirmDeleteCircle}
      />

      <CircleNotePickerDialog
        open={isNotePickerOpen}
        onOpenChange={setIsNotePickerOpen}
        notes={shareableNotes}
        isSharing={shareNoteMutation.isPending}
        onShare={(noteId) => shareNoteMutation.mutate(noteId)}
      />
    </div>
  );
}
