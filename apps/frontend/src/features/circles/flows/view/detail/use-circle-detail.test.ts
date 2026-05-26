import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCircleDetail } from './use-circle-detail';
import { circlesQueryKeys } from '../../../shared/data/circles.query-keys';
import { circlesService } from '../../../shared/data/circles.service';

const useQueryMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => useQueryMock(...args),
}));

describe('useCircleDetail', () => {
  beforeEach(() => {
    useQueryMock.mockReset();
  });

  it('enables query when id is present', () => {
    useQueryMock.mockReturnValue({ data: null });

    useCircleDetail('circle-1');

    const config = useQueryMock.mock.calls[0][0];
    expect(config.queryKey).toEqual(circlesQueryKeys.detail('circle-1'));
    expect(config.enabled).toBe(true);
  });

  it('disables query when id is empty', () => {
    useQueryMock.mockReturnValue({ data: null });

    useCircleDetail('');

    const config = useQueryMock.mock.calls[0][0];
    expect(config.enabled).toBe(false);
  });

  it('calls circlesService.get from queryFn', async () => {
    useQueryMock.mockReturnValue({ data: null });
    const getSpy = vi
      .spyOn(circlesService, 'get')
      .mockResolvedValue({ id: 'circle-1', name: 'Family', ownerId: 'user-1', createdAt: '' } as any);

    useCircleDetail('circle-1');

    const config = useQueryMock.mock.calls[0][0];
    await config.queryFn();

    expect(getSpy).toHaveBeenCalledWith('circle-1');
    getSpy.mockRestore();
  });
});
