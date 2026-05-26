import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateCircleForm } from './create-circle-form';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('./use-create-circle', () => ({
  useCreateCircle: () => ({
    mutateAsync: mocks.mutateAsync,
    isPending: false,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

describe('CreateCircleForm', () => {
  beforeEach(() => {
    mocks.mutateAsync.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
  });

  it('submits successfully and calls onSuccess', async () => {
    mocks.mutateAsync.mockResolvedValue({ id: 'circle-1' });
    const onSuccess = vi.fn();

    const { container } = render(<CreateCircleForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('Family Harmony'), {
      target: { value: 'Family Circle' },
    });
    fireEvent.change(screen.getByPlaceholderText('Weekly family check-ins and shared reminders'), {
      target: { value: 'Family planning' },
    });

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        name: 'Family Circle',
        description: 'Family planning',
      });
    });

    expect(mocks.toastSuccess).toHaveBeenCalledWith('Circle created successfully');
    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows error toast when mutation fails', async () => {
    mocks.mutateAsync.mockRejectedValue(new Error('failed'));

    render(<CreateCircleForm />);

    fireEvent.change(screen.getByPlaceholderText('Family Harmony'), {
      target: { value: 'Family Circle' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create circle' }));

    await screen.findByText('Create a collaborative circle');
    expect(mocks.toastError).toHaveBeenCalledWith('Could not create circle');
  });
});
