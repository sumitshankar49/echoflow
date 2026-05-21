import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../../database/entities/user.entity';
import { Circle } from './circle.entity';

export type CircleMemberRole = 'owner' | 'member';
export type CircleMemberStatus = 'invited' | 'accepted';

@Entity({ name: 'circle_members' })
@Unique('uq_circle_member_user', ['circleId', 'userId'])
export class CircleMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  circleId!: string;

  @ManyToOne(() => Circle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'circleId' })
  circle!: Circle;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 20, default: 'member' })
  role!: CircleMemberRole;

  @Column({ type: 'varchar', length: 20, default: 'invited' })
  status!: CircleMemberStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
