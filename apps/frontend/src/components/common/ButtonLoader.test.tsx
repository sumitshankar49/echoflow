import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ButtonLoader } from './ButtonLoader';

describe('ButtonLoader', () => {
  it('renders default processing label', () => {
    render(<ButtonLoader />);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('renders custom label and className', () => {
    const { container } = render(<ButtonLoader label="Saving" className="custom-loader" />);

    expect(screen.getByText('Saving')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('custom-loader');
  });
});
