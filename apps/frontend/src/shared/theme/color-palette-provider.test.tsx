import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { COLOR_PALETTE_STORAGE_KEY } from './color-palette';
import { ColorPaletteProvider, useColorPalette } from './color-palette-provider';

function mockLocalStorage() {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };

  vi.stubGlobal('localStorage', localStorageMock);
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    configurable: true,
    writable: true,
  });
}

function PaletteProbe() {
  const { palette, setPalette } = useColorPalette();

  return (
    <div>
      <span data-testid="palette-value">{palette}</span>
      <button type="button" onClick={() => setPalette('ocean')}>
        Set ocean
      </button>
    </div>
  );
}

describe('ColorPaletteProvider', () => {
  beforeEach(() => {
    mockLocalStorage();
    localStorage.clear();
    document.documentElement.removeAttribute('data-color-palette');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('data-color-palette');
  });

  it('uses default palette when storage is empty', async () => {
    render(
      <ColorPaletteProvider>
        <PaletteProbe />
      </ColorPaletteProvider>,
    );

    expect(screen.getByTestId('palette-value')).toHaveTextContent('indigo');

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-color-palette', 'indigo');
    });
  });

  it('restores persisted palette from storage', async () => {
    localStorage.setItem(COLOR_PALETTE_STORAGE_KEY, 'emerald');

    render(
      <ColorPaletteProvider>
        <PaletteProbe />
      </ColorPaletteProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('palette-value')).toHaveTextContent('emerald');
      expect(document.documentElement).toHaveAttribute('data-color-palette', 'emerald');
    });
  });

  it('falls back to default palette for invalid storage values', async () => {
    localStorage.setItem(COLOR_PALETTE_STORAGE_KEY, 'invalid-palette');

    render(
      <ColorPaletteProvider>
        <PaletteProbe />
      </ColorPaletteProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('palette-value')).toHaveTextContent('indigo');
      expect(document.documentElement).toHaveAttribute('data-color-palette', 'indigo');
    });
  });

  it('persists palette updates and syncs document attribute', async () => {
    render(
      <ColorPaletteProvider>
        <PaletteProbe />
      </ColorPaletteProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Set ocean' }));

    await waitFor(() => {
      expect(screen.getByTestId('palette-value')).toHaveTextContent('ocean');
      expect(localStorage.getItem(COLOR_PALETTE_STORAGE_KEY)).toBe('ocean');
      expect(document.documentElement).toHaveAttribute('data-color-palette', 'ocean');
    });
  });
});
