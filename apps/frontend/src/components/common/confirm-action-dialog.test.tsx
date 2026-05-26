import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmActionDialog } from './confirm-action-dialog';

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogCancel: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  AlertDialogAction: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('ConfirmActionDialog', () => {
  it('renders dialog labels and calls onConfirm', () => {
    const onConfirm = vi.fn();

    render(
      <ConfirmActionDialog
        open
        onOpenChange={vi.fn()}
        title="Delete item"
        description="This cannot be undone"
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText('Delete item')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading state and disables actions when isLoading is true', () => {
    render(
      <ConfirmActionDialog
        open
        onOpenChange={vi.fn()}
        title="Delete item"
        description="This cannot be undone"
        isLoading
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Please wait...')).toBeDisabled();
  });
});
