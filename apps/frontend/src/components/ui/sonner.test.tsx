import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Toaster } from './sonner';

const sonnerMock = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark' }),
}));

vi.mock('sonner', () => ({
  Toaster: (props: any) => {
    sonnerMock(props);
    return <div data-slot="sonner" />;
  },
}));

describe('Toaster', () => {
  it('passes theme and icon config to Sonner toaster', () => {
    render(<Toaster richColors />);

    expect(sonnerMock).toHaveBeenCalled();
    const props = sonnerMock.mock.calls[0][0];
    expect(props.theme).toBe('dark');
    expect(props.className).toBe('toaster group');
    expect(props.icons.success).toBeTruthy();
    expect(props.icons.error).toBeTruthy();
    expect(props.richColors).toBe(true);
  });
});
