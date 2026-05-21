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
    example: 'Pay electricity bill',
    minLength: 2,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional({
    description: 'Optional reminder details',
    example: 'Due before midnight',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Reminder expiry date-time',
    example: '2026-06-01T10:00:00.000Z',
  })
  @IsDateString()
  expiresAt!: string;

  @ApiPropertyOptional({
    description: 'Mark reminder as completed',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
