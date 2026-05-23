import { ApiProperty } from '@nestjs/swagger';

export class MoodPointDto {
  @ApiProperty({ example: '2026-05-24' })
  date!: string;

  @ApiProperty({ example: 'focused', nullable: true })
  mood!: string | null;
}

export class CurrentMoodDto {
  @ApiProperty({ example: 'focused', nullable: true })
  mood!: string | null;

  @ApiProperty({ example: '2026-05-24T10:15:00.000Z', nullable: true })
  recordedAt!: Date | null;
}

export class TodayMoodResponseDto {
  @ApiProperty({ type: CurrentMoodDto })
  currentMood!: CurrentMoodDto;

  @ApiProperty({ type: MoodPointDto, isArray: true })
  trend!: MoodPointDto[];
}
