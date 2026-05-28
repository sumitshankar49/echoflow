import { buildMariaDbPoolConfig } from './prisma.service';

describe('buildMariaDbPoolConfig', () => {
  it('builds adapter pool config from mysql url', () => {
    const config = buildMariaDbPoolConfig(
      'mysql://user:pa%40ss@localhost:3306/echoflow?connection_limit=30&pool_timeout=45&connect_timeout=10',
    ) as Record<string, unknown>;

    expect(config).toMatchObject({
      host: 'localhost',
      port: 3306,
      user: 'user',
      password: 'pa@ss',
      database: 'echoflow',
      connectionLimit: 30,
      acquireTimeout: 45000,
      connectTimeout: 10000,
    });
  });

  it('builds adapter pool config from mariadb url', () => {
    const config = buildMariaDbPoolConfig(
      'mariadb://user:secret@127.0.0.1:3307/echoflow?connection_limit=15',
    ) as Record<string, unknown>;

    expect(config).toMatchObject({
      host: '127.0.0.1',
      port: 3307,
      user: 'user',
      password: 'secret',
      database: 'echoflow',
      connectionLimit: 15,
      acquireTimeout: 30000,
      connectTimeout: 30000,
    });
  });

  it('returns original url for unsupported protocols', () => {
    const url = 'postgresql://user:password@localhost:5432/echoflow';

    expect(buildMariaDbPoolConfig(url)).toBe(url);
  });
});
