import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFocusSessionDto {
  @ApiProperty({
    description: 'Planned duration of the focus session in minutes',
    example: 25,
    minimum: 1,
    maximum: 120,
  })
  @IsInt()
  @Min(1)
  @Max(120)
  durationMinutes!: number;

  @ApiPropertyOptional({
    description: 'Optional label or task name for this session',
    example: 'Write project proposal',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @ApiPropertyOptional({
    description: 'Whether the session was completed',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  wasCompleted?: boolean;
}
