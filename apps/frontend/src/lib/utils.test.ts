import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('merges and resolves tailwind utility conflicts', () => {
    expect(cn('px-2', 'px-4', 'text-sm', 'text-lg')).toBe('px-4 text-lg');
  });

  it('keeps conditional values and trims falsy values', () => {
    expect(cn('flex', false && 'hidden', null, undefined, 'items-center')).toBe('flex items-center');
  });
});
