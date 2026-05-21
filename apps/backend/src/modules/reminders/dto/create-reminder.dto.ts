import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateReminderDto {
  @ApiProperty({
    description: 'Reminder title',
    example: 'Drink water',
    minLength: 1,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional({
    description: 'Optional reminder description',
    example: 'Take a short hydration break',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Date and time when reminder should trigger',
    example: '2026-05-22T08:30:00.000Z',
  })
  @IsDateString()
  remindAt!: string;

  @ApiPropertyOptional({
    description: 'Whether reminder is completed',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}