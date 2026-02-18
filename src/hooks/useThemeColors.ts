import {useColorScheme} from 'react-native';
import {useSettingsStore} from '../store';
import {COLORS, DARK_COLORS} from '../constants';

/**
 * Returns the appropriate color palette based on the user's theme setting.
 * - 'light' → always light
 * - 'dark' → always dark
 * - 'system' → follows the device setting
 */
export const useThemeColors = (): typeof COLORS => {
  const theme = useSettingsStore(s => s.theme);
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null

  if (theme === 'dark') return DARK_COLORS;
  if (theme === 'light') return COLORS;

  // system
  return systemScheme === 'dark' ? DARK_COLORS : COLORS;
};

/**
 * Returns true when the resolved theme is dark.
 */
export const useIsDarkTheme = (): boolean => {
  const theme = useSettingsStore(s => s.theme);
  const systemScheme = useColorScheme();

  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return systemScheme === 'dark';
};
