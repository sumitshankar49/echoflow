import { DashboardOverview } from '@/features/dashboard/flows/view/dashboard-overview';
import { ContentReveal } from '@/components/common/ContentReveal';

export default function DashboardPage() {
  return (
    <ContentReveal loading={false} loader={null}>
      <DashboardOverview />
    </ContentReveal>
  );
}
