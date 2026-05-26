import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Progress, ProgressLabel, ProgressValue } from './progress';

vi.mock('@base-ui/react/progress', () => {
  const Root = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const Track = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const Indicator = (props: any) => <div {...props} />;
  const Label = ({ children, ...props }: any) => <span {...props}>{children}</span>;
  const Value = ({ children, ...props }: any) => <span {...props}>{children}</span>;
  return { Progress: { Root, Track, Indicator, Label, Value } };
});

describe('Progress', () => {
  it('renders root, track, and indicator', () => {
    const { container } = render(
      <Progress value={40}>
        <ProgressLabel>Upload</ProgressLabel>
        <ProgressValue />
      </Progress>,
    );

    const root = container.querySelector('[data-slot="progress"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('value', '40');
    expect(container.querySelector('[data-slot="progress-track"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="progress-indicator"]')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toHaveAttribute('data-slot', 'progress-label');
    expect(container.querySelector('[data-slot="progress-value"]')).toBeInTheDocument();
  });
});
