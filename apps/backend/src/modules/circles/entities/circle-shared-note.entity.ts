import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Note } from '../../notes/entities/note.entity';
import { Circle } from './circle.entity';

@Entity({ name: 'circle_shared_notes' })
@Unique('uq_circle_shared_note', ['circleId', 'noteId'])
export class CircleSharedNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  circleId!: string;

  @ManyToOne(() => Circle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'circleId' })
  circle!: Circle;

  @Column({ type: 'uuid' })
  noteId!: string;

  @ManyToOne(() => Note, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'noteId' })
  note!: Note;

  @Column({ type: 'uuid' })
  sharedByUserId!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
