import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

export const buildMariaDbPoolConfig = (databaseUrl: string): string | Record<string, unknown> => {
  try {
    const parsedUrl = new URL(databaseUrl);

    if (!['mysql:', 'mariadb:'].includes(parsedUrl.protocol)) {
      return databaseUrl;
    }

    const connectionLimit = Number(parsedUrl.searchParams.get('connection_limit') ?? '20');
    const poolTimeoutMs = Number(parsedUrl.searchParams.get('pool_timeout') ?? '30') * 1000;
    const connectTimeoutMs = Number(parsedUrl.searchParams.get('connect_timeout') ?? '30') * 1000;

    return {
      host: parsedUrl.hostname || '127.0.0.1',
      port: Number(parsedUrl.port || '3306'),
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      database: parsedUrl.pathname.replace(/^\//, ''),
      connectionLimit: Number.isFinite(connectionLimit) ? connectionLimit : 20,
      acquireTimeout: Number.isFinite(poolTimeoutMs) ? poolTimeoutMs : 30000,
      connectTimeout: Number.isFinite(connectTimeoutMs) ? connectTimeoutMs : 30000,
    };

  } catch {
    return databaseUrl;
  }
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const databaseConfig = buildMariaDbPoolConfig(
      configService.getOrThrow<string>('database.url'),
    );
    const adapter = new PrismaMariaDb(databaseConfig);

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
