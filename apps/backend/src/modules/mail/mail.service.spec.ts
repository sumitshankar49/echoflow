/// <reference types="jest" />

import { ConfigService } from '@nestjs/config';

import { MailService } from './mail.service';

describe('MailService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('skips password reset email when provider is not configured', async () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const service = new MailService(configService);
    const warnSpy = jest.spyOn((service as unknown as { logger: { warn: (msg: string) => void } }).logger, 'warn');

    await expect(
      service.sendPasswordResetEmail('candy@example.com', 'Candy User', 'http://localhost/reset'),
    ).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalledWith(
      'Skipping password reset email for candy@example.com because mail provider is not configured',
    );
  });

  it('skips circle invite email when provider is not configured', async () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const service = new MailService(configService);
    const warnSpy = jest.spyOn((service as unknown as { logger: { warn: (msg: string) => void } }).logger, 'warn');

    await expect(
      service.sendCircleInviteEmail('member@example.com', 'Inner Circle', 'http://localhost/invite', 'Candy'),
    ).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalledWith(
      'Skipping circle invite email for member@example.com because mail provider is not configured',
    );
  });
});