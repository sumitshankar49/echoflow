import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class NoteFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter notes by favourite status',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({
    description: 'Filter notes that contain the given tag',
    example: 'work',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tag?: string;
}
