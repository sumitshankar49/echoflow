import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class MemoryFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Optional free-text filter for title/content/tags/sourceType',
    example: 'journal productivity',
  })
  @IsOptional()
  @IsString()
  filter?: string;
}
