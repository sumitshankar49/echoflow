import { describe, expect, it } from 'vitest';

import { circlesQueryKeys } from './circles.query-keys';

describe('circlesQueryKeys', () => {
  it('builds list key from all key', () => {
    expect(circlesQueryKeys.all).toEqual(['circles']);
    expect(circlesQueryKeys.list()).toEqual(['circles', 'list']);
  });

  it('builds detail key with id', () => {
    expect(circlesQueryKeys.detail('circle-1')).toEqual(['circles', 'detail', 'circle-1']);
  });
});
