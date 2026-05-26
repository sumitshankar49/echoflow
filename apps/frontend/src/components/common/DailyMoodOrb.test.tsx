import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DailyMoodOrb } from './DailyMoodOrb';

describe('DailyMoodOrb', () => {
  it('renders mood content and triggers open callback', async () => {
    const onOpenJournal = vi.fn();

    render(<DailyMoodOrb mood="joyful" onOpenJournal={onOpenJournal} />);

    expect(screen.getByRole('heading', { name: 'How are you feeling today?' })).toBeInTheDocument();
    expect(screen.getByText('Open Mood Journal')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));

    expect(onOpenJournal).toHaveBeenCalledTimes(1);
  });

  it('falls back to calm mood style for unknown mood input', () => {
    const onOpenJournal = vi.fn();

    render(<DailyMoodOrb mood={('unknown-mood' as unknown) as never} onOpenJournal={onOpenJournal} />);

    // calm fallback emoji
    expect(screen.getByText('😌')).toBeInTheDocument();
  });
});
