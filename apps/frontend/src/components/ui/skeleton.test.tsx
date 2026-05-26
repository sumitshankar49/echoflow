import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders skeleton styles', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);

    expect(container.firstElementChild).toHaveAttribute('data-slot', 'skeleton');
    expect(container.firstElementChild).toHaveClass('animate-pulse');
    expect(container.firstElementChild).toHaveClass('h-4');
  });
});
