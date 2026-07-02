import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

import { JournalMoodEnum } from './journal-mood.enum';

export class JournalFilterDto {
  @ApiPropertyOptional({
    description: 'Filter journals by exact date (YYYY-MM-DD)',
    example: '2026-05-29',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Filter journals by mood',
    enum: JournalMoodEnum,
    example: JournalMoodEnum.NEUTRAL,
  })
  @IsOptional()
  @IsEnum(JournalMoodEnum)
  mood?: JournalMoodEnum;
}
