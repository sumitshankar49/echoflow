import { ReminderListView } from '@/features/reminders/flows/view/list/reminder-list-view';
import { ContentReveal } from '@/components/common/ContentReveal';

export default function RemindersPage() {
  return (
    <ContentReveal loading={false} loader={null}>
      <ReminderListView />
    </ContentReveal>
  );
}

