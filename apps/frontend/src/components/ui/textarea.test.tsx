import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders with slot attribute', () => {
    render(<Textarea aria-label="notes" />);

    expect(screen.getByLabelText('notes')).toHaveAttribute('data-slot', 'textarea');
  });

  it('updates value', () => {
    render(<Textarea aria-label="bio" />);
    const textarea = screen.getByLabelText('bio');

    fireEvent.change(textarea, { target: { value: 'hello world' } });
    expect(textarea).toHaveValue('hello world');
  });
});
