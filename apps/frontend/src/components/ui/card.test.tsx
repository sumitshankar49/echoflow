import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

describe('Card', () => {
  it('renders card sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('supports size variant', () => {
    const { container } = render(<Card size="sm">Small</Card>);
    expect(container.firstElementChild).toHaveAttribute('data-size', 'sm');
  });
});
