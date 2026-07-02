'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Camera, Loader2, Lock, Save, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getApiErrorMessage } from '@/shared/api/error-message';
import { runConfettiBurst } from '@/shared/utils/confetti';
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordSchema,
  type ProfileSchema,
} from '../../../shared/domain/users.schema';
import { usersService } from '../../../shared/data/users.service';
import { usersQueryKeys } from '../../../shared/data/users.query-keys';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
] as const;

const RELATIONSHIP_OPTIONS = [
  { label: 'Single', value: 'single' },
  { label: 'In relationship', value: 'in_relationship' },
  { label: 'Engaged', value: 'engaged' },
  { label: 'Married', value: 'married' },
  { label: 'Complicated', value: 'complicated' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
] as const;

function getPasswordStrength(password: string) {
  if (!password) {
    return { score: 0, label: 'Very weak' };
  }

  let score = 0;

  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 25;
  if (/\d/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;

  if (score < 30) return { score, label: 'Very weak' };
  if (score < 60) return { score, label: 'Weak' };
  if (score < 80) return { score, label: 'Good' };
  return { score, label: 'Strong' };
}

function getInitials(name: string) {
  const parts = name.split(' ').filter(Boolean);

  if (parts.length === 0) {
    return 'EF';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function ProfileSettingsView() {
  const queryClient = useQueryClient();

  const { data: profile, isPending } = useQuery({
    queryKey: usersQueryKeys.me(),
    queryFn: usersService.getMe,
  });

  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

  const profileForm = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      gender: undefined,
      dob: undefined,
      mobileNumber: undefined,
      relationshipStatus: undefined,
    },
  });

  const passwordForm = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    profileForm.reset({
      name: profile.name ?? '',
      gender: profile.gender ?? undefined,
      dob: profile.dob ?? undefined,
      mobileNumber: profile.mobileNumber ?? undefined,
      relationshipStatus: profile.relationshipStatus ?? undefined,
    });

    const savedAvatar = localStorage.getItem(`avatar_${profile.id}`);
    if (savedAvatar) {
      setAvatarDataUrl(savedAvatar);
    }
  }, [profile, profileForm]);

  const updateProfileMutation = useMutation({
    mutationFn: usersService.updateMe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.me() });
      toast.success('Profile updated successfully');
      runConfettiBurst();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update profile'));
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: usersService.changePassword,
    onSuccess: () => {
      passwordForm.reset();
      toast.success('Password changed successfully');
      runConfettiBurst();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to change password'));
    },
  });

  const newPassword = passwordForm.watch('newPassword');
  const passwordStrength = useMemo(
    () => getPasswordStrength(newPassword ?? ''),
    [newPassword],
  );

  const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatar = String(reader.result ?? '');
      setAvatarDataUrl(avatar);
      localStorage.setItem(`avatar_${profile.id}`, avatar);
      toast.success('Avatar updated');
    };
    reader.readAsDataURL(file);
  };

  const onSaveProfile = profileForm.handleSubmit((values) => {
    updateProfileMutation.mutate(values);
  });

  const onChangePassword = passwordForm.handleSubmit((values) => {
    changePasswordMutation.mutate(values);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-5xl space-y-6"
    >
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-emerald-100 via-sky-100 to-amber-100 p-6 shadow-sm dark:from-emerald-950 dark:via-sky-950 dark:to-amber-950 sm:p-8">
        <div className="absolute -top-14 right-0 h-44 w-44 rounded-full bg-white/35 blur-3xl dark:bg-white/10" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {isPending ? (
              <Skeleton className="h-20 w-20 rounded-full" />
            ) : (
              <Avatar size="lg" className="h-20 w-20 ring-2 ring-white/80">
                <AvatarImage src={avatarDataUrl ?? undefined} alt={profile?.name ?? 'User avatar'} />
                <AvatarFallback>{getInitials(profile?.name ?? '')}</AvatarFallback>
              </Avatar>
            )}

            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                Profile Settings
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                {profile?.name ?? 'Loading profile...'}
              </h1>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{profile?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:w-[320px]">
          <TabsTrigger value="profile" className="gap-2">
            <UserRound className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>
                Keep your profile fresh and personal. Changes sync instantly.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={onSaveProfile} className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarDataUrl ?? undefined} alt={profile?.name ?? 'Profile avatar'} />
                    <AvatarFallback>{getInitials(profile?.name ?? '')}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="avatar" className="text-sm">Avatar image</Label>
                    <div>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="max-w-xs"
                        onChange={onAvatarChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a square image for best quality.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                    <Input id="name" placeholder="Your display name" {...profileForm.register('name')} />
                    {profileForm.formState.errors.name && (
                      <p className="text-xs text-red-500">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                    <Controller
                      name="gender"
                      control={profileForm.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="gender" className="h-9 w-full">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDER_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {profileForm.formState.errors.gender && (
                      <p className="text-xs text-red-500">
                        {profileForm.formState.errors.gender.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of birth <span className="text-red-500">*</span></Label>
                    <Input id="dob" type="date" {...profileForm.register('dob')} />
                    {profileForm.formState.errors.dob && (
                      <p className="text-xs text-red-500">
                        {profileForm.formState.errors.dob.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile number <span className="text-red-500">*</span></Label>
                    <Input
                      id="mobileNumber"
                      placeholder="+1234567890"
                      {...profileForm.register('mobileNumber')}
                    />
                    {profileForm.formState.errors.mobileNumber && (
                      <p className="text-xs text-red-500">
                        {profileForm.formState.errors.mobileNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationshipStatus">Relationship status <span className="text-red-500">*</span></Label>
                    <Controller
                      name="relationshipStatus"
                      control={profileForm.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="relationshipStatus" className="h-9 w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIP_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {profileForm.formState.errors.relationshipStatus && (
                      <p className="text-xs text-red-500">
                        {profileForm.formState.errors.relationshipStatus.message}
                      </p>
                    )}
                  </div>
                </div>

                <motion.div
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.15 }}
                  className="flex justify-end"
                >
                  <Button type="submit" disabled={updateProfileMutation.isPending} className="gap-2">
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save profile
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Use a strong password to keep your account secure.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={onChangePassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Current password"
                    {...passwordForm.register('currentPassword')}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-red-500">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Create a strong password"
                    {...passwordForm.register('newPassword')}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-red-500">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength</span>
                      <span className="font-medium">{passwordStrength.label}</span>
                    </div>
                    <Progress value={passwordStrength.score} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    {...passwordForm.register('confirmPassword')}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <motion.div
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.15 }}
                  className="flex justify-end"
                >
                  <Button type="submit" disabled={changePasswordMutation.isPending} className="gap-2">
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" /> Update password
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}