import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../database/entities/user.entity';
import { CirclesController } from './circles.controller';
import { CirclesService } from './circles.service';
import { CircleMember } from './entities/circle-member.entity';
import { Circle } from './entities/circle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Circle, CircleMember, User])],
  controllers: [CirclesController],
  providers: [CirclesService],
  exports: [CirclesService],
})
export class CirclesModule {}
