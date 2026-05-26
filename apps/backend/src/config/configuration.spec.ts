/// <reference types="jest" />

import configuration from './configuration';

describe('configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses DATABASE_URL when provided', () => {
    process.env.DATABASE_URL = 'mysql://user:pass@localhost:3306/db';

    const config = configuration();

    expect(config.database.url).toBe('mysql://user:pass@localhost:3306/db');
  });

  it('builds database url from DB_* env vars when DATABASE_URL is absent', () => {
    delete process.env.DATABASE_URL;
    process.env.DB_HOST = '127.0.0.1';
    process.env.DB_PORT = '3307';
    process.env.DB_USER = 'root';
    process.env.DB_PASSWORD = 'secret';
    process.env.DB_NAME = 'echoflow';

    const config = configuration();

    expect(config.database.url).toBe('mysql://root:secret@127.0.0.1:3307/echoflow');
  });

  it('parses numeric and boolean values safely', () => {
    process.env.PORT = 'not-a-number';
    process.env.DB_PORT = '3310';
    process.env.DB_SYNCHRONIZE = 'yes';
    process.env.DB_LOGGING = '0';

    const config = configuration();

    expect(config.app.port).toBe(4000);
    expect(config.database.port).toBe(3310);
    expect(config.database.synchronize).toBe(true);
    expect(config.database.logging).toBe(false);
  });
});