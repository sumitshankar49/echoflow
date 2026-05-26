"use client";

import dynamic from "next/dynamic";

import { ActiveCirclesCard } from "./dashboard-overview/components/active-circles-card";
import { DashboardHeroSection } from "./dashboard-overview/components/dashboard-hero-section";
import { FocusPlanCard } from "./dashboard-overview/components/focus-plan-card";
import { MusicQuickPlayerCard } from "./dashboard-overview/components/music-quick-player-card";
import { QuickNavGrid } from "./dashboard-overview/components/quick-nav-grid";
import { RecentNotesCard } from "./dashboard-overview/components/recent-notes-card";
import { SmartSuggestionsCard } from "./dashboard-overview/components/smart-suggestions-card";
import { UpcomingRemindersCard } from "./dashboard-overview/components/upcoming-reminders-card";
import { useDashboardOverviewData } from "./dashboard-overview/hooks/use-dashboard-overview-data";
import { useDashboardPlayer } from "./dashboard-overview/hooks/use-dashboard-player";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export function DashboardOverview() {
  const {
    me,
    notesCount,
    pendingRemindersCount,
    activeCirclesCount,
    isOverviewPending,
    topReminders,
    recentNotes,
    activeCircles,
    quickPlayerPlaylist,
    smartSuggestions,
  } = useDashboardOverviewData();

  const {
    activeTrackUrl,
    trackIndex,
    hasTracks,
    isPlaying,
    safeElapsed,
    safeDuration,
    remainingSeconds,
    musicProgress,
    setIsPlaying,
    setElapsedSeconds,
    setDurationSeconds,
    goToPreviousTrack,
    goToNextTrack,
  } = useDashboardPlayer(quickPlayerPlaylist);

  return (
    <div className="relative w-full space-y-6 pb-6">
      <DashboardHeroSection
        me={me}
        notesCount={notesCount}
        topRemindersCount={pendingRemindersCount}
        activeCirclesCount={activeCirclesCount}
        nextReminderTitle={topReminders[0]?.title}
        recentNoteTitle={recentNotes[0]?.title}
        playlistName={quickPlayerPlaylist?.name}
      />

      <QuickNavGrid />

      <section className="grid gap-4 xl:grid-cols-12">
        <FocusPlanCard
          topRemindersCount={pendingRemindersCount}
          nextReminderTitle={topReminders[0]?.title}
          recentNoteTitle={recentNotes[0]?.title}
        />

        <RecentNotesCard isPending={isOverviewPending} recentNotes={recentNotes} />

        <UpcomingRemindersCard topReminders={topReminders} />
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <ActiveCirclesCard activeCircles={activeCircles} />

        <MusicQuickPlayerCard
          quickPlayerPlaylist={quickPlayerPlaylist}
          activeTrackUrl={activeTrackUrl}
          trackIndex={trackIndex}
          hasTracks={hasTracks}
          isPlaying={isPlaying}
          safeElapsed={safeElapsed}
          safeDuration={safeDuration}
          remainingSeconds={remainingSeconds}
          musicProgress={musicProgress}
          setIsPlaying={setIsPlaying}
          setElapsedSeconds={setElapsedSeconds}
          setDurationSeconds={setDurationSeconds}
          goToPreviousTrack={goToPreviousTrack}
          goToNextTrack={goToNextTrack}
          ReactPlayer={ReactPlayer}
        />

        <SmartSuggestionsCard smartSuggestions={smartSuggestions} />
      </section>
    </div>
  );
}
