import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import type { StringValue } from 'ms';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { CirclesModule } from './modules/circles/circles.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MoodModule } from './modules/mood/mood.module';
import { MusicModule } from './modules/music/music.module';
import { NotesModule } from './modules/notes/notes.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: configService.getOrThrow<StringValue>('jwt.accessExpiresIn'),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    CirclesModule,
    DashboardModule,
    MoodModule,
    MusicModule,
    NotesModule,
    RemindersModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
