import { Note } from '../../notes/entities/note.entity';
import { Circle } from './circle.entity';
export declare class CircleSharedNote {
    id: string;
    circleId: string;
    circle: Circle;
    noteId: string;
    note: Note;
    sharedByUserId: string;
    createdAt: Date;
}
