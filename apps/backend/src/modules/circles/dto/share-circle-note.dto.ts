import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ShareCircleNoteDto {
  @ApiProperty({
    description: 'Note id to share into the circle',
    example: '4e1f38ad-489a-4d9c-a9e1-d7d6fcf8508b',
  })
  @IsUUID()
  @IsNotEmpty()
  noteId!: string;
}
