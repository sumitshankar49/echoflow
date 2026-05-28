'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  COLOR_PALETTE_STORAGE_KEY,
  DEFAULT_COLOR_PALETTE,
  isColorPalette,
  type ColorPalette,
} from './color-palette';

interface ColorPaletteContextValue {
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;
}

const ColorPaletteContext = createContext<ColorPaletteContextValue | null>(null);

const applyPaletteToDocument = (palette: ColorPalette): void => {
  document.documentElement.setAttribute('data-color-palette', palette);
};

export function ColorPaletteProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<ColorPalette>(DEFAULT_COLOR_PALETTE);

  useEffect(() => {
    const storedPalette = localStorage.getItem(COLOR_PALETTE_STORAGE_KEY);

    if (storedPalette && isColorPalette(storedPalette)) {
      setPaletteState(storedPalette);
      applyPaletteToDocument(storedPalette);
      return;
    }

    applyPaletteToDocument(DEFAULT_COLOR_PALETTE);
  }, []);

  const setPalette = useCallback((nextPalette: ColorPalette) => {
    setPaletteState(nextPalette);
    localStorage.setItem(COLOR_PALETTE_STORAGE_KEY, nextPalette);
    applyPaletteToDocument(nextPalette);
  }, []);

  const value = useMemo(
    () => ({
      palette,
      setPalette,
    }),
    [palette, setPalette],
  );

  return <ColorPaletteContext.Provider value={value}>{children}</ColorPaletteContext.Provider>;
}

export const useColorPalette = (): ColorPaletteContextValue => {
  const context = useContext(ColorPaletteContext);

  if (!context) {
    throw new Error('useColorPalette must be used within a ColorPaletteProvider');
  }

  return context;
};
