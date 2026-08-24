export interface ThemeColors {
  background: string;
  surface: string;
  board: string;
  cell: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentSecondary: string;
  danger: string;
  overlay: string;
}

export const Palette: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: '#F3F0FB',
    surface: '#FFFFFF',
    board: '#DED4F7',
    cell: '#CEC1F2',
    text: '#221933',
    textSecondary: '#6B6089',
    accent: '#6A3DFF',
    accentSecondary: '#1F9E89',
    danger: '#E9526B',
    overlay: 'rgba(20, 16, 31, 0.72)',
  },
  dark: {
    background: '#120E1E',
    surface: '#1D1830',
    board: '#251E40',
    cell: '#332A55',
    text: '#F5F3FF',
    textSecondary: '#AFA3D6',
    accent: '#9A7BFF',
    accentSecondary: '#3FCDB6',
    danger: '#FF7A90',
    overlay: 'rgba(8, 6, 15, 0.8)',
  },
};

export type ThemeName = keyof typeof Palette;

interface TileStyle {
  bg: string;
  text: string;
}

export const TileColors: Record<number, TileStyle> = {
  2: { bg: '#E7E1FB', text: '#332A55' },
  4: { bg: '#D3C5F7', text: '#332A55' },
  8: { bg: '#B7A1F2', text: '#241C3D' },
  16: { bg: '#9A7BFF', text: '#FFFFFF' },
  32: { bg: '#815EFF', text: '#FFFFFF' },
  64: { bg: '#6A3DFF', text: '#FFFFFF' },
  128: { bg: '#48D9C4', text: '#0E332C' },
  256: { bg: '#2FB39D', text: '#FFFFFF' },
  512: { bg: '#1F9E89', text: '#FFFFFF' },
  1024: { bg: '#FFD166', text: '#4A3300' },
  2048: { bg: '#FF7A90', text: '#3B0010' },
};

export const TILE_FALLBACK: TileStyle = { bg: '#241C3D', text: '#FFD166' };

export function tileStyleFor(value: number): TileStyle {
  return TileColors[value] ?? TILE_FALLBACK;
}
