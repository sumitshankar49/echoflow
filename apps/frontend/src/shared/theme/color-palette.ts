export const COLOR_PALETTE_STORAGE_KEY = 'ecoflow:color-palette';

export const COLOR_PALETTES = [
  {
    id: 'indigo',
    label: 'Indigo',
    swatchClassName: 'from-indigo-500 to-violet-500',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatchClassName: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'rose',
    label: 'Rose',
    swatchClassName: 'from-rose-500 to-pink-500',
  },
  {
    id: 'amber',
    label: 'Amber',
    swatchClassName: 'from-amber-500 to-orange-500',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    swatchClassName: 'from-sky-500 to-cyan-500',
  },
  {
    id: 'orchid',
    label: 'Orchid',
    swatchClassName: 'from-fuchsia-500 to-purple-500',
  },
] as const;

export type ColorPalette = (typeof COLOR_PALETTES)[number]['id'];

export const DEFAULT_COLOR_PALETTE: ColorPalette = 'indigo';

export const isColorPalette = (value: string): value is ColorPalette => {
  return COLOR_PALETTES.some((palette) => palette.id === value);
};
