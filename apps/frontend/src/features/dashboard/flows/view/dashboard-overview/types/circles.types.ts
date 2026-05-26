import type { Circle } from '@/features/circles/shared/domain/circles.types';

export type DashboardCircle = Pick<Circle, 'id' | 'name' | 'members'>;
