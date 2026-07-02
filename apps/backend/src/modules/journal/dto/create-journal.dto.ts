import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { JournalMoodEnum } from './journal-mood.enum';

export class CreateJournalDto {
  @ApiProperty({
    description: 'Journal title',
    example: 'Evening Reflection',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'Journal content',
    example: 'Today I focused deeply for two hours and felt calm afterward.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'Mood for this journal entry',
    enum: JournalMoodEnum,
    example: JournalMoodEnum.CALM,
  })
  @IsEnum(JournalMoodEnum)
  mood!: JournalMoodEnum;

  @ApiPropertyOptional({
    description: 'Optional tags attached to this journal entry',
    example: ['focus', 'reflection'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Logical journal date',
    example: '2026-05-29',
  })
  @IsDateString()
  date!: string;
}
