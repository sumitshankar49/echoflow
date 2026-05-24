"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Flame,
  Lock,
  Loader2,
  MoonStar,
  Palette,
  Phone,
  Save,
  Settings2,
  Sparkles,
  Sun,
  Target,
  Timer,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { ShimmerCard } from "@/components/common/ShimmerCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { notesService } from "@/features/notes/shared/data/notes.service";
import { notesQueryKeys } from "@/features/notes/shared/data/notes.query-keys";
import { remindersService } from "@/features/reminders/shared/data/reminders.service";
import { usersService } from "@/features/users/shared/data/users.service";
import { usersQueryKeys } from "@/features/users/shared/data/users.query-keys";
import { runConfettiBurst } from "@/shared/utils/confetti";

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
] as const;

const RELATIONSHIP_OPTIONS = [
  { label: "Single", value: "single" },
  { label: "In relationship", value: "in_relationship" },
  { label: "Engaged", value: "engaged" },
  { label: "Married", value: "married" },
  { label: "Complicated", value: "complicated" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
] as const;

const floatingOrbs = [
  { top: "8%", left: "12%", size: 180, color: "bg-violet-500/20", duration: 20, delay: 0 },
  { top: "62%", left: "78%", size: 220, color: "bg-cyan-400/18", duration: 24, delay: 1.2 },
  { top: "30%", left: "68%", size: 140, color: "bg-indigo-500/20", duration: 18, delay: 0.4 },
  { top: "76%", left: "20%", size: 120, color: "bg-sky-400/16", duration: 22, delay: 0.9 },
];

type Gender = "male" | "female" | "other" | "prefer_not_to_say";

type RelationshipStatus =
  | "single"
  | "in_relationship"
  | "engaged"
  | "married"
  | "complicated"
  | "prefer_not_to_say";

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (!parts.length) {
    return "EF";
  }

  return parts
    .slice(0, 2)
    .map((part) => (part[0] ? part[0].toUpperCase() : ""))
    .join("");
}

function getShortDate(value?: string) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const { data: me, isPending: profilePending } = useQuery({
    queryKey: usersQueryKeys.me(),
    queryFn: usersService.getMe,
  });

  const { data: notes = [], isPending: notesPending } = useQuery({
    queryKey: notesQueryKeys.list(),
    queryFn: notesService.list,
  });

  const { data: reminders = [], isPending: remindersPending } = useQuery({
    queryKey: ["profile", "reminders"],
    queryFn: () => remindersService.listAll({ isCompleted: false, limit: 100 }),
  });

  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus | "">("");

  const [clockPref, setClockPref] = useState<"12h" | "24h">("12h");
  const [isClockPrefHydrated, setIsClockPrefHydrated] = useState(false);

  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const savedClockPref = localStorage.getItem("profile_clock_pref");
    if (savedClockPref === "12h" || savedClockPref === "24h") {
      setClockPref(savedClockPref);
    }
    setIsClockPrefHydrated(true);
  }, []);

  useEffect(() => {
    if (!me) {
      return;
    }

    setName(me.name || "");
    setMobileNumber(me.mobileNumber || "");
    setDob(toDateInputValue(me.dob));
    setGender((me.gender as Gender | null) || "");
    setRelationshipStatus((me.relationshipStatus as RelationshipStatus | null) || "");

    const avatar = localStorage.getItem(`avatar_${me.id}`);
    const savedBio = localStorage.getItem(`profile_bio_${me.id}`);

    if (avatar) {
      setAvatarDataUrl(avatar);
    }

    if (savedBio) {
      setBio(savedBio);
    }
  }, [me]);

  useEffect(() => {
    if (!isClockPrefHydrated) {
      return;
    }
    localStorage.setItem("profile_clock_pref", clockPref);
  }, [clockPref, isClockPrefHydrated]);

  const updateProfileMutation = useMutation({
    mutationFn: usersService.updateMe,
    onSuccess: async (updatedUser) => {
      setName(updatedUser.name || "");
      setMobileNumber(updatedUser.mobileNumber || "");
      setDob(toDateInputValue(updatedUser.dob));
      setGender((updatedUser.gender as Gender | null) || "");
      setRelationshipStatus((updatedUser.relationshipStatus as RelationshipStatus | null) || "");

      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.me() });

      if (me) {
        localStorage.setItem(`profile_bio_${me.id}`, bio);
      }

      localStorage.setItem("profile_clock_pref", clockPref);

      toast.success("Profile updated successfully");
      runConfettiBurst();
    },
    onError: () => {
      toast.error("Unable to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: usersService.changePassword,
    onSuccess: () => {
      setNewPassword("");
      setConfirmPassword("");
      setIsSecurityOpen(false);
      toast.success("Password changed successfully");
      runConfettiBurst();
    },
    onError: () => {
      toast.error("Unable to change password");
    },
  });

  const focusHours = useMemo(
    () => Math.max(1, Math.round((notes.length * 18 + reminders.length * 12) / 60)),
    [notes.length, reminders.length],
  );

  const statsView = useMemo(
    () => [
      {
        label: "Notes Created",
        value: String(notes.length),
        sub: `+${Math.max(3, Math.round(notes.length * 0.15))} this week`,
        icon: FileText,
        tone: "text-violet-300",
      },
      {
        label: "Habits Tracked",
        value: String(reminders.length),
        sub: `${Math.max(2, Math.round(reminders.length * 0.25))} day streak`,
        icon: Target,
        tone: "text-sky-300",
      },
      {
        label: "Focus Time",
        value: `${focusHours}h`,
        sub: `+${Math.max(6, Math.round(notes.length * 0.2))}h this week`,
        icon: Timer,
        tone: "text-cyan-300",
      },
      {
        label: "Join Date",
        value: getShortDate(me?.createdAt),
        sub: `${new Date().getFullYear() - new Date(me?.createdAt || Date.now()).getFullYear()} year ago`,
        icon: CalendarDays,
        tone: "text-fuchsia-300",
      },
    ],
    [focusHours, me?.createdAt, notes.length, reminders.length],
  );

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !me) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatar = String(reader.result || "");
      setAvatarDataUrl(avatar);
      localStorage.setItem(`avatar_${me.id}`, avatar);
      toast.success("Avatar updated");
    };
    reader.readAsDataURL(file);
  };

  const onSaveProfile = () => {
    if (!name.trim()) {
      toast.info("Name is required");
      return;
    }

    const payload = {
      name: name.trim(),
      ...(gender ? { gender } : {}),
      ...(dob ? { dob } : {}),
      ...(mobileNumber ? { mobileNumber: mobileNumber.replace(/\s+/g, "") } : {}),
      ...(relationshipStatus ? { relationshipStatus } : {}),
    };

    updateProfileMutation.mutate(payload);
  };

  const onResetProfile = () => {
    if (!me) {
      return;
    }

    setName(me.name || "");
    setMobileNumber(me.mobileNumber || "");
    setDob(toDateInputValue(me.dob));
    setGender((me.gender as Gender | null) || "");
    setRelationshipStatus((me.relationshipStatus as RelationshipStatus | null) || "");

    const savedBio = localStorage.getItem(`profile_bio_${me.id}`);
    setBio(savedBio || "");

    toast.success("Changes reset");
  };

  const onChangePassword = () => {
    if (!newPassword || !confirmPassword) {
      toast.info("Please complete new password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    changePasswordMutation.mutate({
      newPassword,
      confirmPassword,
    });
  };

  const pageLoading = profilePending || notesPending || remindersPending;

  return (
    <div className="relative min-h-[calc(100vh-5rem)] w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.3),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.26),transparent_38%),radial-gradient(circle_at_52%_88%,rgba(34,211,238,0.24),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />

      {floatingOrbs.map((orb, index) => (
        <motion.div
          key={`orb-${index}`}
          className={`pointer-events-none absolute -z-10 rounded-full blur-3xl ${orb.color}`}
          style={{ top: orb.top, left: orb.left, width: orb.size, height: orb.size }}
          animate={{ y: [0, -14, 0, 10, 0], x: [0, 10, 0, -8, 0], scale: [1, 1.05, 1, 0.97, 1] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
        />
      ))}

      <div className="mx-auto w-full max-w-[1400px] space-y-5 px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        {pageLoading ? (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.07 }}
                >
                  <ShimmerCard lineCount={4} showAvatar delay={index * 0.05} className="h-[250px]" />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="relative overflow-hidden rounded-2xl border border-indigo-400/25 bg-[linear-gradient(145deg,rgba(20,26,73,0.94),rgba(20,34,92,0.9),rgba(14,28,76,0.94))] p-5 shadow-[0_28px_90px_-44px_rgba(79,70,229,0.7)] backdrop-blur-2xl sm:p-6"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_10%,rgba(139,92,246,0.22),transparent_35%),radial-gradient(circle_at_85%_28%,rgba(34,211,238,0.18),transparent_30%)]" />
              <div className="pointer-events-none absolute -right-20 top-6 h-44 w-80 rounded-full bg-gradient-to-r from-cyan-300/20 to-violet-400/20 blur-2xl" />

              <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto]">
                <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
                  <label className="group relative mx-auto block h-32 w-32 cursor-pointer md:mx-0">
                    <Avatar className="h-32 w-32 ring-4 ring-indigo-400/70 shadow-xl shadow-indigo-500/35">
                      <AvatarImage src={avatarDataUrl || undefined} alt={me?.name || "User"} />
                      <AvatarFallback className="text-2xl">{getInitials(me?.name || "")}</AvatarFallback>
                    </Avatar>
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/0 text-white opacity-0 transition-all group-hover:bg-slate-950/50 group-hover:opacity-100">
                      <Camera className="h-6 w-6" />
                    </span>
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-indigo-500 p-2 shadow-lg shadow-indigo-500/45">
                      <Camera className="h-3.5 w-3.5 text-white" />
                    </span>
                    <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
                  </label>

                  <div className="space-y-3 text-center md:text-left">
                    <div className="space-y-1">
                      <h1 className="inline-flex items-center gap-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        {me?.name || "EchoFlow User"}
                        <span className="rounded-full bg-violet-500/90 p-1">
                          <Sparkles className="h-3 w-3 text-white" />
                        </span>
                      </h1>
                      <p className="text-sm text-indigo-100/85">{me?.email}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                      <Badge className="rounded-md border-0 bg-indigo-500/35 px-2.5 py-1 text-xs text-indigo-100">
                        Pro Member
                      </Badge>
                      <span className="inline-flex items-center gap-2 text-sm text-indigo-100/95">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Online
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="relative mt-6 grid gap-3 border-t border-indigo-200/15 pt-5 sm:grid-cols-2 xl:grid-cols-4">
                {statsView.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: index * 0.05 }}
                    className="flex items-center gap-3 rounded-xl px-2 py-1.5"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/10">
                      <item.icon className={`h-5 w-5 ${item.tone}`} />
                    </span>
                    <div>
                      <p className="text-3xl font-semibold leading-none text-white">{item.value}</p>
                      <p className="mt-1 text-xs text-indigo-100/80">{item.label}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-300/90">
                        <Flame className="h-3 w-3" />
                        {item.sub}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <section className="grid gap-4 xl:grid-cols-2">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="rounded-2xl border-indigo-300/25 bg-[linear-gradient(145deg,rgba(20,26,73,0.86),rgba(20,34,92,0.82),rgba(14,28,76,0.88))] shadow-[0_24px_70px_-40px_rgba(2,132,199,0.6)] backdrop-blur-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-2xl text-white">Profile Information</CardTitle>
                        <CardDescription className="text-indigo-100/70">Update your personal details</CardDescription>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        All changes saved
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-indigo-100">Full Name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Your full name"
                          className="h-11 border-indigo-200/30 bg-white/95 pl-10 text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-indigo-100">Date of Birth</Label>
                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <Input
                            type="date"
                            value={dob}
                            onChange={(event) => setDob(event.target.value)}
                            className="h-11 border-indigo-200/30 bg-white/95 pl-10 text-slate-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-indigo-100">Mobile Number</Label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <Input
                            value={mobileNumber}
                            onChange={(event) => setMobileNumber(event.target.value)}
                            placeholder="+91 98765 43210"
                            className="h-11 border-indigo-200/30 bg-white/95 pl-10 text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-indigo-100">Bio</Label>
                      <div className="relative">
                        <Textarea
                          value={bio}
                          maxLength={160}
                          onChange={(event) => setBio(event.target.value)}
                          placeholder="Share what drives you and how you use EchoFlow..."
                          className="min-h-24 border-indigo-200/30 bg-white/95 pr-14 text-slate-900 placeholder:text-slate-400"
                        />
                        <span className="absolute bottom-2 right-3 text-xs text-slate-500">{bio.length}/160</span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-indigo-100">Gender</Label>
                        <Select value={gender || undefined} onValueChange={(value) => setGender(value as Gender)}>
                          <SelectTrigger className="h-11 border-indigo-200/30 bg-white/95 text-slate-900">
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
                      </div>
                      <div className="space-y-2">
                        <Label className="text-indigo-100">Relationship Status</Label>
                        <Select
                          value={relationshipStatus || undefined}
                          onValueChange={(value) => setRelationshipStatus(value as RelationshipStatus)}
                        >
                          <SelectTrigger className="h-11 border-indigo-200/30 bg-white/95 text-slate-900">
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
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        onClick={onSaveProfile}
                        disabled={updateProfileMutation.isPending}
                        className="h-11 min-w-48 bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/35 hover:from-violet-400 hover:to-indigo-400"
                      >
                        {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={onResetProfile}
                        className="h-11 min-w-40 text-indigo-100 hover:bg-white/10 hover:text-white"
                      >
                        Reset Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34, delay: 0.05 }}>
                <Card className="h-full rounded-2xl border-indigo-300/25 bg-[linear-gradient(145deg,rgba(20,26,73,0.86),rgba(20,34,92,0.82),rgba(14,28,76,0.88))] shadow-[0_24px_70px_-40px_rgba(79,70,229,0.65)] backdrop-blur-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-white">Settings & Preferences</CardTitle>
                    <CardDescription className="text-indigo-100/70">Customize your experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="rounded-xl border border-indigo-200/20 bg-white/6 p-4">
                      <div className="mb-3 flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/14">
                          <Palette className="h-4 w-4 text-cyan-300" />
                        </span>
                        <div>
                          <p className="font-medium text-white">Appearance</p>
                          <p className="text-sm text-indigo-100/70">Choose your preferred theme</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setTheme("light")}
                          className={`h-9 border-indigo-200/30 text-indigo-100 hover:bg-white/10 ${theme === "light" ? "bg-indigo-500/55 text-white" : "bg-white/5"}`}
                        >
                          <Sun className="h-3.5 w-3.5" />
                          Light
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setTheme("dark")}
                          className={`h-9 border-indigo-200/30 text-indigo-100 hover:bg-white/10 ${theme === "dark" ? "bg-indigo-500/55 text-white" : "bg-white/5"}`}
                        >
                          <MoonStar className="h-3.5 w-3.5" />
                          Dark
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setTheme("system")}
                          className={`h-9 border-indigo-200/30 text-indigo-100 hover:bg-white/10 ${theme === "system" ? "bg-indigo-500/55 text-white" : "bg-white/5"}`}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          System
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-indigo-200/20 bg-white/6 p-4">
                      <div className="mb-3 flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-400/14">
                          <Clock3 className="h-4 w-4 text-indigo-200" />
                        </span>
                        <div>
                          <p className="font-medium text-white">Clock Preference</p>
                          <p className="text-sm text-indigo-100/70">Choose your time format</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setClockPref("12h")}
                          className={`h-9 border-indigo-200/30 text-indigo-100 hover:bg-white/10 ${clockPref === "12h" ? "bg-indigo-500/55 text-white" : "bg-white/5"}`}
                        >
                          12 Hour
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setClockPref("24h")}
                          className={`h-9 border-indigo-200/30 text-indigo-100 hover:bg-white/10 ${clockPref === "24h" ? "bg-indigo-500/55 text-white" : "bg-white/5"}`}
                        >
                          24 Hour
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-indigo-200/20 bg-white/6 p-4">
                      <div className="mb-3 flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-400/14">
                          <Settings2 className="h-4 w-4 text-rose-200" />
                        </span>
                        <div>
                          <p className="font-medium text-white">Account Security</p>
                          <p className="text-sm text-indigo-100/70">Keep your account safe</p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full justify-between border-indigo-200/20 bg-white/5 text-indigo-100 hover:bg-white/10"
                        onClick={() => setIsSecurityOpen((value) => !value)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Change Password
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {isSecurityOpen ? (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-3">
                          <Input
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="New password"
                            className="h-10 border-indigo-200/30 bg-white/95 text-slate-900 placeholder:text-slate-400 dark:bg-slate-950/65 dark:text-slate-100 dark:placeholder:text-slate-400"
                          />
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Confirm new password"
                            className="h-10 border-indigo-200/30 bg-white/95 text-slate-900 placeholder:text-slate-400 dark:bg-slate-950/65 dark:text-slate-100 dark:placeholder:text-slate-400"
                          />
                          <div className="flex justify-end">
                            <Link
                              href="/forgot-password"
                              className="text-xs font-medium text-cyan-200 underline-offset-4 transition-colors hover:text-cyan-100 hover:underline"
                            >
                              Forgot password?
                            </Link>
                          </div>
                          <Button
                            onClick={onChangePassword}
                            disabled={changePasswordMutation.isPending}
                            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                          >
                            {changePasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                            {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                          </Button>
                        </motion.div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
