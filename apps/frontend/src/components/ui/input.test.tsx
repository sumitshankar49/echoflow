import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from './input';

describe('Input', () => {
  it('renders with slot attribute', () => {
    render(<Input placeholder="Email" />);

    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('data-slot', 'input');
  });

  it('accepts typing', () => {
    render(<Input aria-label="name" />);

    const input = screen.getByLabelText('name');
    fireEvent.change(input, { target: { value: 'Candy' } });
    expect(input).toHaveValue('Candy');
  });
});
