import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { CirclesController } from './circles.controller';
import { CirclesService } from './circles.service';

@Module({
  imports: [MailModule],
  controllers: [CirclesController],
  providers: [CirclesService],
  exports: [CirclesService],
})
export class CirclesModule {}
