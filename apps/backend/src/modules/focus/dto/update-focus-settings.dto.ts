import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdateFocusSettingsDto {
  @ApiPropertyOptional({
    description: 'Focus session duration in minutes',
    example: 25,
    minimum: 1,
    maximum: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  focusDuration?: number;

  @ApiPropertyOptional({
    description: 'Short break duration in minutes',
    example: 5,
    minimum: 1,
    maximum: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  shortBreakDuration?: number;

  @ApiPropertyOptional({
    description: 'Long break duration in minutes',
    example: 15,
    minimum: 1,
    maximum: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  longBreakDuration?: number;

  @ApiPropertyOptional({
    description: 'Number of focus sessions before a long break',
    example: 4,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  sessionsUntilLongBreak?: number;

  @ApiPropertyOptional({
    description: 'Whether breaks should auto-start after a focus session ends',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  autoStartBreaks?: boolean;

  @ApiPropertyOptional({
    description: 'Whether focus sessions should auto-start after a break ends',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  autoStartSessions?: boolean;

  @ApiPropertyOptional({
    description: 'Whether notification sounds are enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  soundEnabled?: boolean;
}
