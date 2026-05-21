import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({
    description: 'Playlist name',
    example: 'Deep Focus',
    minLength: 1,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional playlist description',
    example: 'Lo-fi and ambient tracks for coding sessions',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional list of track links or IDs',
    type: [String],
    example: ['spotify:track:123', 'spotify:track:456'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tracks?: string[];
}