import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './badge';

describe('Badge', () => {
  it('renders children with default styles', () => {
    render(<Badge>New</Badge>);

    const badge = screen.getByText('New');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe('SPAN');
  });

  it('applies variant styles', () => {
    render(<Badge variant="outline">Outline</Badge>);

    expect(screen.getByText('Outline')).toHaveClass('border-border');
  });
});
