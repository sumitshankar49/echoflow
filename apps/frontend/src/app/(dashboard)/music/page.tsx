import { PlaylistListView } from '@/features/music/flows/view/list/playlist-list-view';
import { ContentReveal } from '@/components/common/ContentReveal';

export default function MusicPage() {
  return (
    <ContentReveal loading={false} loader={null}>
      <PlaylistListView />
    </ContentReveal>
  );
}
