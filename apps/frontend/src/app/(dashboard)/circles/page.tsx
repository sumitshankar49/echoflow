import { CircleListView } from '@/features/circles/flows/view/list/circle-list-view';
import { ContentReveal } from '@/components/common/ContentReveal';

export default function CirclesPage() {
  return (
    <ContentReveal loading={false} loader={null}>
      <CircleListView />
    </ContentReveal>
  );
}
