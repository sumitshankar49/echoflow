import { User } from '../../../database/entities/user.entity';
import { CircleMember } from './circle-member.entity';

export class Circle {
  id!: string;

  name!: string;

  description!: string | null;

  ownerId!: string;

  owner?: User;

  members?: CircleMember[];

  createdAt!: Date;

  updatedAt!: Date;
}