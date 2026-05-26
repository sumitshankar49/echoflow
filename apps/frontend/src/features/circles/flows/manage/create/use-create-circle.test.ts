import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCreateCircle } from './use-create-circle';
import { circlesQueryKeys } from '../../../shared/data/circles.query-keys';
import { circlesService } from '../../../shared/data/circles.service';

const invalidateQueries = vi.fn();
const useMutationMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries }),
  useMutation: (...args: any[]) => useMutationMock(...args),
}));

describe('useCreateCircle', () => {
  it('wires mutation function and invalidates list on success', async () => {
    useMutationMock.mockImplementation((config: any) => ({
      ...config,
      mutateAsync: vi.fn(),
      isPending: false,
    }));

    renderHook(() => useCreateCircle());

    const config = useMutationMock.mock.calls[0][0];

    expect(useMutationMock).toHaveBeenCalled();
    expect(config.mutationFn).toBe(circlesService.create);

    await config.onSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: circlesQueryKeys.list(),
    });
  });
});
