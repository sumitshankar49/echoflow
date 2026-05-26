import { describe, expect, it } from 'vitest';

import { createCircleSchema } from './circles.schema';

describe('circles.schema', () => {
  it('accepts valid create circle payload', () => {
    const result = createCircleSchema.safeParse({
      name: 'Family Circle',
      description: 'Family updates and reminders',
    });

    expect(result.success).toBe(true);
  });

  it('rejects short circle name', () => {
    const result = createCircleSchema.safeParse({
      name: 'A',
      description: 'Too short name',
    });

    expect(result.success).toBe(false);
  });

  it('accepts payload without description', () => {
    const result = createCircleSchema.safeParse({
      name: 'Team Circle',
    });

    expect(result.success).toBe(true);
  });
});
