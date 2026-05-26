import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContentReveal } from './ContentReveal';

describe('ContentReveal', () => {
  it('shows loader when loading is true', () => {
    render(
      <ContentReveal loading loader={<div>Loading state</div>}>
        <div>Loaded content</div>
      </ContentReveal>,
    );

    expect(screen.getByText('Loading state')).toBeInTheDocument();
    expect(screen.queryByText('Loaded content')).not.toBeInTheDocument();
  });

  it('shows children when loading is false', () => {
    render(
      <ContentReveal loading={false} loader={<div>Loading state</div>}>
        <div>Loaded content</div>
      </ContentReveal>,
    );

    expect(screen.getByText('Loaded content')).toBeInTheDocument();
    expect(screen.queryByText('Loading state')).not.toBeInTheDocument();
  });
});
