import { describe, expect, it, vi } from 'vitest';

import { useCircleList } from './use-circle-list';
import { circlesService } from '../../../shared/data/circles.service';
import { circlesQueryKeys } from '../../../shared/data/circles.query-keys';

const useQueryMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => useQueryMock(...args),
}));

describe('useCircleList', () => {
  it('wires query key and query function', () => {
    useQueryMock.mockReturnValue({ data: [] });

    useCircleList();

    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: circlesQueryKeys.list(),
      queryFn: circlesService.list,
    });
  });
});
