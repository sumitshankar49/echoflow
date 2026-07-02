"use client";

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
import { SectionTitle } from '@/components/common/SectionTitle';

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
    playlistName,
    activeTrackUrl,
    activeTrackTitle,
    trackIndex,
    hasTracks,
    isPlaying,
    safeElapsed,
    safeDuration,
    remainingSeconds,
    musicProgress,
    togglePlayback,
    closePlayback,
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

      <SectionTitle
        title="Plan and Priorities"
        description="Actionable reminders, notes, and focus-ready tasks for the day."
      />

      <section className="grid gap-4 xl:grid-cols-12">
        <FocusPlanCard
          topRemindersCount={pendingRemindersCount}
          nextReminderTitle={topReminders[0]?.title}
          recentNoteTitle={recentNotes[0]?.title}
        />

        <RecentNotesCard isPending={isOverviewPending} recentNotes={recentNotes} />

        <UpcomingRemindersCard topReminders={topReminders} />
      </section>

      <SectionTitle
        title="Connection and Flow"
        description="Stay close to your circles, soundtrack, and smart guidance."
      />

      <section className="grid gap-4 xl:grid-cols-12">
        <ActiveCirclesCard activeCircles={activeCircles} />

        <MusicQuickPlayerCard
          quickPlayerPlaylist={quickPlayerPlaylist}
          playlistName={playlistName}
          activeTrackUrl={activeTrackUrl}
          activeTrackTitle={activeTrackTitle}
          trackIndex={trackIndex}
          hasTracks={hasTracks}
          isPlaying={isPlaying}
          safeElapsed={safeElapsed}
          safeDuration={safeDuration}
          remainingSeconds={remainingSeconds}
          musicProgress={musicProgress}
          togglePlayback={togglePlayback}
          closePlayback={closePlayback}
          goToPreviousTrack={goToPreviousTrack}
          goToNextTrack={goToNextTrack}
        />

        <SmartSuggestionsCard smartSuggestions={smartSuggestions} />
      </section>
    </div>
  );
}
