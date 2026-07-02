import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { HabitFrequencyEnum } from './create-habit.dto';

export class UpdateHabitDto {
  @ApiPropertyOptional({ description: 'Habit name', minLength: 1, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Habit description', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiPropertyOptional({ description: 'Hex color', example: '#10b981' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ description: 'Emoji icon', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @ApiPropertyOptional({ enum: HabitFrequencyEnum })
  @IsOptional()
  @IsEnum(HabitFrequencyEnum)
  frequency?: HabitFrequencyEnum;

  @ApiPropertyOptional({ description: 'Target days per week', minimum: 1, maximum: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  targetDaysPerWeek?: number;

  @ApiPropertyOptional({ description: 'Archive the habit' })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
