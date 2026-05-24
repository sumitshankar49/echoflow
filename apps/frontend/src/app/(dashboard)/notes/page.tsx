import { NoteListView } from '@/features/notes/flows/view/list/note-list-view';
import { ContentReveal } from '@/components/common/ContentReveal';

export default function NotesPage() {
  return (
    <ContentReveal loading={false} loader={null}>
      <NoteListView />
    </ContentReveal>
  );
}
