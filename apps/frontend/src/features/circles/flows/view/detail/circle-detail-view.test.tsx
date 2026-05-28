import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CircleDetailView } from './circle-detail-view';

const mocks = vi.hoisted(() => ({
  useCircleDetail: vi.fn(),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  circlesInvite: vi.fn(),
  circlesAccept: vi.fn(),
  circlesDecline: vi.fn(),
  circlesLeave: vi.fn(),
  circlesRemoveMember: vi.fn(),
  circlesUpdate: vi.fn(),
  circlesRemove: vi.fn(),
  circlesListSharedNotes: vi.fn(),
  circlesShareNote: vi.fn(),
  circlesUnshareNote: vi.fn(),
  invalidateQueries: vi.fn(),
  dialogRender: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, initial, animate, exit, transition, whileHover, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    section: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
  useQuery: (...args: any[]) => mocks.useQuery(...args),
  useMutation: (...args: any[]) => mocks.useMutation(...args),
}));

vi.mock('./use-circle-detail', () => ({
  useCircleDetail: mocks.useCircleDetail,
}));

vi.mock('@/features/circles/shared/data/circles.service', () => ({
  circlesService: {
    invite: (...args: any[]) => mocks.circlesInvite(...args),
    acceptInvitation: (...args: any[]) => mocks.circlesAccept(...args),
    declineInvitation: (...args: any[]) => mocks.circlesDecline(...args),
    leaveCircle: (...args: any[]) => mocks.circlesLeave(...args),
    removeMember: (...args: any[]) => mocks.circlesRemoveMember(...args),
    update: (...args: any[]) => mocks.circlesUpdate(...args),
    remove: (...args: any[]) => mocks.circlesRemove(...args),
    listSharedNotes: (...args: any[]) => mocks.circlesListSharedNotes(...args),
    shareNote: (...args: any[]) => mocks.circlesShareNote(...args),
    unshareNote: (...args: any[]) => mocks.circlesUnshareNote(...args),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => mocks.toastSuccess(...args),
    error: (...args: any[]) => mocks.toastError(...args),
    info: (...args: any[]) => mocks.toastInfo(...args),
  },
}));

vi.mock('@/components/common/confirm-action-dialog', () => ({
  ConfirmActionDialog: (props: any) => {
    mocks.dialogRender(props);
    const { open, title, onConfirm, onOpenChange } = props;

    return open ? (
      <div data-testid={`dialog-${title}`}>
        <button onClick={() => void onConfirm?.()}>{`confirm-${title}`}</button>
        <button onClick={() => onOpenChange?.(false)}>{`close-${title}`}</button>
      </div>
    ) : null;
  },
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ open, children }: any) => (open ? <div data-testid="note-picker-dialog">{children}</div> : null),
  AlertDialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
}));

describe('CircleDetailView', () => {
  const writeTextMock = vi.fn();

  const createMutation = () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  });

  beforeEach(() => {
    mocks.useCircleDetail.mockReset();
    mocks.useQuery.mockReset();
    mocks.useMutation.mockReset();
    mocks.circlesInvite.mockReset();
    mocks.circlesAccept.mockReset();
    mocks.circlesDecline.mockReset();
    mocks.circlesLeave.mockReset();
    mocks.circlesRemoveMember.mockReset();
    mocks.circlesUpdate.mockReset();
    mocks.circlesRemove.mockReset();
    mocks.circlesListSharedNotes.mockReset();
    mocks.circlesShareNote.mockReset();
    mocks.circlesUnshareNote.mockReset();
    mocks.invalidateQueries.mockReset();
    mocks.dialogRender.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
    mocks.toastInfo.mockReset();
    writeTextMock.mockReset();

    mocks.circlesInvite.mockResolvedValue({ message: 'ok' });
    mocks.circlesAccept.mockResolvedValue({});
    mocks.circlesDecline.mockResolvedValue({});
    mocks.circlesLeave.mockResolvedValue({});
    mocks.circlesRemoveMember.mockResolvedValue({});
    mocks.circlesUpdate.mockResolvedValue({});
    mocks.circlesRemove.mockResolvedValue({});
    mocks.circlesListSharedNotes.mockResolvedValue([]);
    mocks.circlesShareNote.mockResolvedValue({});
    mocks.circlesUnshareNote.mockResolvedValue({});

    mocks.useMutation.mockReturnValue(createMutation());

    mocks.useQuery.mockImplementation((config: any) => {
      const key = Array.isArray(config?.queryKey) ? config.queryKey : [];
      if (key[0] === 'users' && key[1] === 'me') {
        return { data: { id: 'user-1' } };
      }
      if (key[0] === 'notes' && key[1] === 'list') {
        return { data: [] };
      }
      if (key[0] === 'circles' && key[1] === 'shared-notes') {
        return { data: [] };
      }
      return { data: null };
    });

    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });
  });

  it('renders loading state', () => {
    mocks.useCircleDetail.mockReturnValue({ isPending: true, isError: false, data: null });

    render(<CircleDetailView id="circle-1" />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mocks.useCircleDetail.mockReturnValue({ isPending: false, isError: true, data: null });

    render(<CircleDetailView id="circle-1" />);

    expect(screen.getByText('Circle not found.')).toBeInTheDocument();
  });

  it('renders owner view with management panels', () => {
    mocks.useCircleDetail.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: 'circle-1',
        name: 'Family Circle',
        description: 'Family updates',
        ownerId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        members: [
          {
            id: 'member-1',
            circleId: 'circle-1',
            userId: 'user-1',
            role: 'owner',
            status: 'accepted',
            user: {
              id: 'user-1',
              name: 'Candy',
              email: 'candy@example.com',
            },
          },
        ],
      },
    });

    render(<CircleDetailView id="circle-1" />);

    expect(screen.getByRole('heading', { name: 'Family Circle' })).toBeInTheDocument();
    expect(screen.getByText('Invite members beautifully')).toBeInTheDocument();
    expect(screen.getByText('Manage circle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('handles invited member accept/decline actions', () => {
    const mutate = vi.fn();
    mocks.useMutation.mockReturnValue({
      mutate,
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mocks.useQuery.mockImplementation((config: any) => {
      const key = Array.isArray(config?.queryKey) ? config.queryKey : [];
      if (key[0] === 'users' && key[1] === 'me') {
        return { data: { id: 'user-2' } };
      }
      if (key[0] === 'notes' && key[1] === 'list') {
        return { data: [] };
      }
      if (key[0] === 'circles' && key[1] === 'shared-notes') {
        return { data: [] };
      }
      return { data: null };
    });

    mocks.useCircleDetail.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: 'circle-1',
        name: 'Family Circle',
        description: 'Family updates',
        ownerId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        members: [
          {
            id: 'member-2',
            circleId: 'circle-1',
            userId: 'user-2',
            role: 'member',
            status: 'invited',
            user: {
              id: 'user-2',
              name: 'Sam',
              email: 'sam@example.com',
            },
          },
        ],
      },
    });

    render(<CircleDetailView id="circle-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));

    expect(mutate).toHaveBeenCalledTimes(2);
  });

  it('shows validation message when saving with blank name', async () => {
    mocks.useCircleDetail.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: 'circle-1',
        name: 'Family Circle',
        description: 'Family updates',
        ownerId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        members: [],
      },
    });

    render(<CircleDetailView id="circle-1" />);

    fireEvent.change(screen.getByPlaceholderText('Circle name'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(mocks.toastInfo).toHaveBeenCalledWith('Circle name is required');
    });
  });

  it('copies invite link and handles clipboard failure', async () => {
    mocks.useCircleDetail.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: 'circle-1',
        name: 'Family Circle',
        description: 'Family updates',
        ownerId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        members: [],
      },
    });

    writeTextMock.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('copy failed'));

    render(<CircleDetailView id="circle-1" />);

    const copyButton = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(copyButton);
    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith('Invite link copied');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copied' }));
    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith('Could not copy link');
    });
  });

  it('opens leave dialog and confirms leave action', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mocks.useMutation.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
    });

    mocks.useQuery.mockImplementation((config: any) => {
      const key = Array.isArray(config?.queryKey) ? config.queryKey : [];
      if (key[0] === 'users' && key[1] === 'me') {
        return { data: { id: 'user-2' } };
      }
      if (key[0] === 'notes' && key[1] === 'list') {
        return { data: [] };
      }
      if (key[0] === 'circles' && key[1] === 'shared-notes') {
        return { data: [] };
      }
      return { data: null };
    });

    mocks.useCircleDetail.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: 'circle-1',
        name: 'Family Circle',
        description: 'Family updates',
        ownerId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        members: [
          {
            id: 'member-2',
            circleId: 'circle-1',
            userId: 'user-2',
            role: 'member',
            status: 'accepted',
            user: {
              id: 'user-2',
              name: 'Sam',
              email: 'sam@example.com',
            },
          },
        ],
      },
    });

    render(<CircleDetailView id="circle-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Leave circle' }));
    fireEvent.click(screen.getByRole('button', { name: 'confirm-Leave circle' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });
  });

  it('handles owner actions for invite, save, delete, and remove-member dialogs', async () => {
    const mutate = vi.fn();
    const mutateAsync = vi.fn().mockResolvedValue({});

    mocks.useMutation.mockReturnValue({
      mutate,
      mutateAsync,
      isPending: false,
    });

    mocks.useQuery.mockImplementation((config: any) => {
      const key = Array.isArray(config?.queryKey) ? config.queryKey : [];
      if (key[0] === 'users' && key[1] === 'me') {
        return { data: { id: 'user-1' } };
      }
      if (key[0] === 'notes' && key[1] === 'list') {
        return {
          data: [
            {
              id: 'note-1',
              title: 'Planning Note',
              content: '<p>Shared details</p>',
              updatedAt: '2026-01-02T00:00:00.000Z',
            },
          ],
        };
      }
      if (key[0] === 'circles' && key[1] === 'shared-notes') {
        return {
          data: [
            {
              id: 'shared-1',
              circleId: 'circle-1',
              noteId: 'note-1',
              sharedByUserId: 'user-1',
              createdAt: '2026-01-02T00:00:00.000Z',
              note: {
                id: 'note-1',
                title: 'Planning Note',
                content: '<p>Shared details</p>',
                tags: [],
                isFavorite: false,
                userId: 'user-1',
                createdAt: '2026-01-02T00:00:00.000Z',
                updatedAt: '2026-01-02T00:00:00.000Z',
              },
              sharedBy: {
                id: 'user-1',
                name: 'Candy',
                email: 'candy@example.com',
              },
            },
          ],
        };
      }
      return { data: null };
    });

    mocks.useCircleDetail.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: 'circle-1',
        name: 'Family Circle',
        description: 'Family updates',
        ownerId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        members: [
          {
            id: 'owner-1',
            circleId: 'circle-1',
            userId: 'user-1',
            role: 'owner',
            status: 'accepted',
            user: {
              id: 'user-1',
              name: 'Candy',
              email: 'candy@example.com',
            },
          },
          {
            id: 'member-2',
            circleId: 'circle-1',
            userId: 'user-2',
            role: 'member',
            status: 'accepted',
            user: {
              id: 'user-2',
              name: 'Sam',
              email: 'sam@example.com',
            },
          },
        ],
      },
    });

    const { container } = render(<CircleDetailView id="circle-1" />);

    fireEvent.change(screen.getByPlaceholderText('member@team.com'), {
      target: { value: ' newmember@example.com ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(mutate).toHaveBeenCalledWith('newmember@example.com');

    fireEvent.change(screen.getByPlaceholderText('Add a short description'), {
      target: { value: 'Updated purpose' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        name: 'Family Circle',
        description: 'Updated purpose',
      });
    });

    expect(screen.getByText('Planning Note')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open note picker' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete circle' }));
    fireEvent.click(screen.getByRole('button', { name: 'confirm-Delete circle' }));

    const iconOnlyButtons = Array.from(container.querySelectorAll('button')).filter(
      (button) => (button.textContent || '').trim() === '',
    );
    fireEvent.click(iconOnlyButtons[0]!);
    expect(screen.getByTestId('dialog-Remove member')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'close-Remove member' }));
    expect(screen.queryByTestId('dialog-Remove member')).not.toBeInTheDocument();

    fireEvent.click(iconOnlyButtons[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'confirm-Remove member' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('member-2');
    });
  });

  it('opens the note picker and shares a note from the modal', async () => {
    const mutate = vi.fn();
    const mutation = {
      mutate,
      mutateAsync: vi.fn(),
      isPending: false,
    };

    mocks.useMutation.mockReturnValue(mutation);

    mocks.useQuery.mockImplementation((config: any) => {
      const key = Array.isArray(config?.queryKey) ? config.queryKey : [];
      if (key[0] === 'users' && key[1] === 'me') {
        return { data: { id: 'user-1' } };
      }
      if (key[0] === 'notes' && key[1] === 'list') {
        return {
          data: [
            {
              id: 'note-2',
              title: 'Ideas Vault',
              content: '<p>Draft plan for the group.</p>',
              tags: ['ideas'],
              isFavorite: true,
              updatedAt: '2026-01-02T00:00:00.000Z',
            },
          ],
        };
      }
      if (key[0] === 'circles' && key[1] === 'shared-notes') {
        return { data: [] };
      }
      return { data: null };
    });

    mocks.useCircleDetail.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: 'circle-1',
        name: 'Family Circle',
        description: 'Family updates',
        ownerId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        members: [
          {
            id: 'owner-1',
            circleId: 'circle-1',
            userId: 'user-1',
            role: 'owner',
            status: 'accepted',
            user: {
              id: 'user-1',
              name: 'Candy',
              email: 'candy@example.com',
            },
          },
        ],
      },
    });

    render(<CircleDetailView id="circle-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Open note picker' }));

    expect(screen.getByTestId('note-picker-dialog')).toBeInTheDocument();
    expect(screen.getByText('Ideas Vault')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Share' }));

    expect(mutate).toHaveBeenCalledWith('note-2');
  });

  it('covers all mutation callbacks and remove-member no-op confirm branch', async () => {
    const originalLocation = window.location;
    const replaceMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        replace: replaceMock,
      },
    });

    mocks.useCircleDetail.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: 'circle-1',
        name: 'Family Circle',
        description: 'Family updates',
        ownerId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        members: [
          {
            id: 'owner-1',
            circleId: 'circle-1',
            userId: 'user-1',
            role: 'owner',
            status: 'accepted',
            user: {
              id: 'user-1',
              name: 'Candy',
              email: 'candy@example.com',
            },
          },
        ],
      },
    });

    render(<CircleDetailView id="circle-1" />);

    const configs = mocks.useMutation.mock.calls.map(([config]) => config);
    expect(configs.length).toBeGreaterThanOrEqual(9);

    await act(async () => {
      await configs[0].mutationFn?.('member@example.com');
      await configs[1].mutationFn?.();
      await configs[2].mutationFn?.();
      await configs[3].mutationFn?.();
      await configs[4].mutationFn?.('member-2');
      await configs[5].mutationFn?.('note-1');
      await configs[6].mutationFn?.('note-1');
      await configs[7].mutationFn?.({ name: 'Updated', description: 'Desc' });
      await configs[8].mutationFn?.();

      await configs[0].onSuccess?.({ message: 'Invite sent with context' });
      await configs[0].onSuccess?.({});
      configs[0].onError?.({ response: { status: 404, data: { message: 'email missing' } } });

      await configs[1].onSuccess?.();
      configs[1].onError?.();

      await configs[2].onSuccess?.();
      configs[2].onError?.();

      await configs[3].onSuccess?.();
      configs[3].onError?.();

      await configs[4].onSuccess?.();
      configs[4].onError?.();

      await configs[5].onSuccess?.();
      configs[5].onError?.();

      await configs[6].onSuccess?.();
      configs[6].onError?.();

      await configs[7].onSuccess?.();
      configs[7].onError?.();

      await configs[8].onSuccess?.();
      configs[8].onError?.();
    });

    const removeDialogProps = mocks.dialogRender.mock.calls
      .map(([props]) => props)
      .find((props) => props.title === 'Remove member');
    await removeDialogProps?.onConfirm?.();

    expect(replaceMock).toHaveBeenCalledWith('/circles');
    expect(mocks.toastError).toHaveBeenCalledWith(
      'No account found for this email yet. Share the invite link so they can join after sign up.',
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Invitation accepted');
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Circle details updated');
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Circle deleted');
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Note shared to circle');
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Shared note removed');
    expect(mocks.circlesInvite).toHaveBeenCalledWith('circle-1', { email: 'member@example.com' });
    expect(mocks.circlesAccept).toHaveBeenCalledWith('circle-1');
    expect(mocks.circlesDecline).toHaveBeenCalledWith('circle-1');
    expect(mocks.circlesLeave).toHaveBeenCalledWith('circle-1');
    expect(mocks.circlesRemoveMember).toHaveBeenCalledWith('circle-1', 'member-2');
    expect(mocks.circlesUpdate).toHaveBeenCalledWith('circle-1', {
      name: 'Updated',
      description: 'Desc',
    });
    expect(mocks.circlesRemove).toHaveBeenCalledWith('circle-1');
    expect(mocks.circlesShareNote).toHaveBeenCalledWith('circle-1', { noteId: 'note-1' });
    expect(mocks.circlesUnshareNote).toHaveBeenCalledWith('circle-1', 'note-1');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });
});
