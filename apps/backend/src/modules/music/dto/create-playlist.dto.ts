import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({
    description: 'Playlist name',
    example: 'Deep Focus Session',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional playlist description',
    example: 'Instrumental lo-fi and ambient tracks.',
    maxLength: 400,
  })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional playlist cover image URL',
    example: 'https://cdn.example.com/playlists/focus-cover.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  coverUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether this playlist is visible publicly',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
