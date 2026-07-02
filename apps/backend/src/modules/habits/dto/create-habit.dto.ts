import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum HabitFrequencyEnum {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export class CreateHabitDto {
  @ApiProperty({ description: 'Habit name', example: 'Morning meditation', minLength: 1, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Habit description', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiPropertyOptional({ description: 'Hex color for the habit', example: '#7c3aed' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ description: 'Emoji icon', example: '🧘', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @ApiPropertyOptional({ enum: HabitFrequencyEnum, default: HabitFrequencyEnum.DAILY })
  @IsOptional()
  @IsEnum(HabitFrequencyEnum)
  frequency?: HabitFrequencyEnum;

  @ApiPropertyOptional({ description: 'Target days per week (1-7)', example: 5, minimum: 1, maximum: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  targetDaysPerWeek?: number;
}
