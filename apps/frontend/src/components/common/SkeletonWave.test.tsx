import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SkeletonWave } from './SkeletonWave';

describe('SkeletonWave', () => {
  it('renders base skeleton styles', () => {
    const { container } = render(<SkeletonWave />);

    expect(container.firstElementChild).toHaveClass('relative');
    expect(container.firstElementChild).toHaveClass('rounded-xl');
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonWave className="h-10 w-20" />);

    expect(container.firstElementChild).toHaveClass('h-10');
    expect(container.firstElementChild).toHaveClass('w-20');
  });
});
