import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../../database/entities/user.entity';
import { Circle } from './circle.entity';

@Entity({ name: 'circle_members' })
@Unique('uq_circle_member_user', ['circleId', 'userId'])
export class CircleMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_circle_members_circle_id')
  @Column({ type: 'uuid' })
  circleId!: string;

  @Index('idx_circle_members_user_id')
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20, default: 'member' })
  role!: 'owner' | 'member';

  @Column({ type: 'varchar', length: 20, default: 'invited' })
  status!: 'invited' | 'accepted';

  @ManyToOne(() => Circle, (circle) => circle.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'circleId' })
  circle!: Circle;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}