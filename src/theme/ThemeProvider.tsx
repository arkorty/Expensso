/**
 * MD3 ThemeProvider — React Context bridge between zustand settings and MD3 tokens.
 *
 * Wraps the app and exposes `useTheme()` which returns the fully resolved
 * MD3Theme object (colors, typography, elevation, shape, spacing).
 */

import React, {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {useSettingsStore} from '../store/settingsStore';
import {LightTheme, DarkTheme, BlackTheme} from './md3';
import type {MD3Theme} from './md3';

const ThemeContext = createContext<MD3Theme>(LightTheme);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const themeSetting = useSettingsStore(s => s.theme);
  const systemScheme = useColorScheme();

  const resolvedTheme = useMemo<MD3Theme>(() => {
    if (themeSetting === 'black') return BlackTheme;
    if (themeSetting === 'dark') return DarkTheme;
    if (themeSetting === 'light') return LightTheme;
    return systemScheme === 'dark' ? DarkTheme : LightTheme;
  }, [themeSetting, systemScheme]);

  return (
    <ThemeContext.Provider value={resolvedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access the full MD3 theme from anywhere in the tree.
 */
export const useTheme = (): MD3Theme => useContext(ThemeContext);
