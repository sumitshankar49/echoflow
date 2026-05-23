import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';
import { Mood } from './entities/mood.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mood])],
  controllers: [MoodController],
  providers: [MoodService],
  exports: [MoodService],
})
export class MoodModule {}
