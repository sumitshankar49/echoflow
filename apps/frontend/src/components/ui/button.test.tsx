import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('renders with data-slot and children', () => {
    render(<Button>Submit</Button>);

    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-slot', 'button');
  });

  it('applies variant and size classes', () => {
    render(
      <Button variant="destructive" size="sm">
        Delete
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button.className).toContain('bg-destructive');
    expect(button.className).toContain('h-7');
  });
});
