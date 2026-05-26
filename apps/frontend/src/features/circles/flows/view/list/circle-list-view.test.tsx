import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CircleListView } from './circle-list-view';

const mocks = vi.hoisted(() => ({
  useCircleList: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, transition, ...props }: any) => <div {...props}>{children}</div>,
    article: ({ children, initial, animate, transition, ...props }: any) => (
      <article {...props}>{children}</article>
    ),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => mocks.useQuery(...args),
}));

vi.mock('./use-circle-list', () => ({
  useCircleList: mocks.useCircleList,
}));

vi.mock('../../manage/create/create-circle-form', () => ({
  CreateCircleForm: () => <div data-testid="create-circle-form" />,
}));

vi.mock('@/components/common/ShimmerCard', () => ({
  ShimmerCard: () => <div data-testid="shimmer-card" />,
}));

describe('CircleListView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.useQuery.mockReset();
    mocks.useCircleList.mockReset();
    mocks.useQuery.mockReturnValue({ data: { id: 'user-1' } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading placeholders initially', () => {
    mocks.useCircleList.mockReturnValue({
      data: [],
      isPending: true,
      isFetching: false,
      isError: false,
    });

    render(<CircleListView />);

    expect(screen.getAllByTestId('shimmer-card').length).toBeGreaterThan(0);
  });

  it('shows empty state when no circles exist', async () => {
    mocks.useCircleList.mockReturnValue({
      data: [],
      isPending: false,
      isFetching: false,
      isError: false,
    });

    render(<CircleListView />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText('No circles yet')).toBeInTheDocument();
    expect(screen.getByTestId('create-circle-form')).toBeInTheDocument();
  });

  it('renders circles when data is available', async () => {
    mocks.useCircleList.mockReturnValue({
      data: [
        {
          id: 'circle-1',
          name: 'Family Circle',
          description: 'Family updates',
          ownerId: 'user-1',
          members: [],
        },
      ],
      isPending: false,
      isFetching: false,
      isError: false,
    });

    render(<CircleListView />);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText('Family Circle')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open circle/i })).toHaveAttribute('href', '/circles/circle-1');
  });
});
