import { useColorScheme } from 'react-native';

import { Palette, type ThemeColors } from '../constants/theme';

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: Palette[isDark ? 'dark' : 'light'], isDark };
}
