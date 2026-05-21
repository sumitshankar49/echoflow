import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Note title',
    example: 'Project ideas',
    minLength: 1,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  title!: string;

  @ApiProperty({
    description: 'Main note content',
    example: 'Build EchoFlow Notes module with user-scoped CRUD.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({
    description: 'Optional URL for voice note recording',
    example: 'https://cdn.example.com/voice/abc123.mp3',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  voiceUrl?: string;

  @ApiPropertyOptional({
    description: 'Optional tags for categorization',
    example: ['work', 'backend', 'nestjs'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Mark note as favorite',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
