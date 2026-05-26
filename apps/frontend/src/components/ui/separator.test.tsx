import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Separator } from './separator';

vi.mock('@base-ui/react/separator', () => ({
  Separator: (props: any) => <div {...props} />,
}));

describe('Separator', () => {
  it('renders horizontal by default', () => {
    const { container } = render(<Separator />);

    expect(container.firstElementChild).toHaveAttribute('data-slot', 'separator');
    expect(container.firstElementChild).toHaveAttribute('orientation', 'horizontal');
  });

  it('renders vertical orientation', () => {
    const { container } = render(<Separator orientation="vertical" />);
    expect(container.firstElementChild).toHaveAttribute('orientation', 'vertical');
  });
});
