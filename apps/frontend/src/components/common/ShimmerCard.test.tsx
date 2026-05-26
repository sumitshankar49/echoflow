import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ShimmerCard } from './ShimmerCard';

describe('ShimmerCard', () => {
  it('renders default number of skeleton lines', () => {
    const { container } = render(<ShimmerCard />);

    const lineElements = container.querySelectorAll('.h-3');
    expect(lineElements).toHaveLength(3);
  });

  it('renders avatar row when showAvatar is true', () => {
    const { container } = render(<ShimmerCard showAvatar lineCount={2} />);

    expect(container.querySelector('.h-10.w-10')).toBeInTheDocument();
    expect(container.querySelectorAll('.h-3')).toHaveLength(2);
  });

  it('applies custom className', () => {
    const { container } = render(<ShimmerCard className="custom-card" />);

    expect(container.firstElementChild).toHaveClass('custom-card');
  });
});
