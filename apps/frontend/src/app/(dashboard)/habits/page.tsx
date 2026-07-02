import { HabitTrackerView } from '@/features/habits/flows/view/habit-tracker-view';

export const metadata = {
  title: 'HabitFlow · EchoFlow',
  description: 'A smooth and modern way to track streaks, check in daily, and stay consistent.',
};

export default function HabitsPage() {
  return <HabitTrackerView />;
}
