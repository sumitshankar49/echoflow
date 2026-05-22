import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ReminderFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by completion status',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'Filter reminders from this date (inclusive)',
    example: '2026-05-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter reminders up to this date (inclusive)',
    example: '2026-05-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
