import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ShareCircleNoteDto {
  @ApiProperty({
    description: 'Note UUID to share into the circle',
    example: '8cbe4c5c-d0e8-4d3f-b2b8-4b7b6dbdb1f0',
  })
  @IsUUID()
  noteId!: string;
}