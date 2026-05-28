import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

/**
 * Maps SSL/TLS URL query params to a mariadb pool ssl option.
 *
 * - `sslaccept=strict` or `ssl=strict` → verify server cert using OS CAs
 * - `ssl=true` / `ssl=1` / `tls=true`  → SSL enabled, cert validation relaxed
 * - `ssl=false` / `ssl=0` / `ssl=none` → SSL explicitly disabled (no ssl key added)
 * - absent                              → undefined (no ssl key added)
 */
const buildSslConfig = (
  parsedUrl: URL,
): Record<string, unknown> | boolean | undefined => {
  const ssl = parsedUrl.searchParams.get('ssl')?.toLowerCase();
  const sslaccept = parsedUrl.searchParams.get('sslaccept')?.toLowerCase();
  const tls = parsedUrl.searchParams.get('tls')?.toLowerCase();

  const disabled = new Set(['false', '0', 'none', 'disabled']);
  if ((ssl && disabled.has(ssl)) || (tls && disabled.has(tls))) {
    return undefined;
  }

  if (sslaccept === 'strict' || ssl === 'strict') {
    // Verify server certificate using OS certificate store.
    return true;
  }

  if (ssl || tls || sslaccept) {
    // SSL required but certificate validation is relaxed (e.g. self-signed certs).
    return { rejectUnauthorized: false };
  }

  return undefined;
};

export const buildMariaDbPoolConfig = (databaseUrl: string): string | Record<string, unknown> => {
  try {
    const parsedUrl = new URL(databaseUrl);

    if (!['mysql:', 'mariadb:'].includes(parsedUrl.protocol)) {
      return databaseUrl;
    }

    const connectionLimit = Number(parsedUrl.searchParams.get('connection_limit') ?? '20');
    const poolTimeoutMs = Number(parsedUrl.searchParams.get('pool_timeout') ?? '30') * 1000;
    const connectTimeoutMs = Number(parsedUrl.searchParams.get('connect_timeout') ?? '30') * 1000;

    const config: Record<string, unknown> = {
      host: parsedUrl.hostname || '127.0.0.1',
      port: Number(parsedUrl.port || '3306'),
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      database: parsedUrl.pathname.replace(/^\//, ''),
      connectionLimit: Number.isFinite(connectionLimit) ? connectionLimit : 20,
      acquireTimeout: Number.isFinite(poolTimeoutMs) ? poolTimeoutMs : 30000,
      connectTimeout: Number.isFinite(connectTimeoutMs) ? connectTimeoutMs : 30000,
    };

    const ssl = buildSslConfig(parsedUrl);
    if (ssl !== undefined) {
      config.ssl = ssl;
    }

    return config;
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
