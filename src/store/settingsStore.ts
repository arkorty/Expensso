import {create} from 'zustand';
import {AppSettings, Currency} from '../types';
import {mmkvStorage} from './mmkv';

interface SettingsState extends AppSettings {
  // Actions
  setBaseCurrency: (currency: Currency) => void;
  setLocale: (locale: string) => void;
  setTheme: (theme: AppSettings['theme']) => void;
  setBiometric: (enabled: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  hydrate: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  // Default state (hydrated from MMKV on app load)
  baseCurrency: 'INR',
  locale: 'en',
  theme: 'light',
  biometricEnabled: false,
  onboardingComplete: false,

  // Actions persist to MMKV and update zustand state simultaneously
  setBaseCurrency: (currency: Currency) => {
    mmkvStorage.setBaseCurrency(currency);
    set({baseCurrency: currency});
  },

  setLocale: (locale: string) => {
    mmkvStorage.setLocale(locale);
    set({locale});
  },

  setTheme: (theme: AppSettings['theme']) => {
    mmkvStorage.setTheme(theme);
    set({theme});
  },

  setBiometric: (enabled: boolean) => {
    mmkvStorage.setBiometric(enabled);
    set({biometricEnabled: enabled});
  },

  setOnboardingComplete: (complete: boolean) => {
    mmkvStorage.setOnboardingComplete(complete);
    set({onboardingComplete: complete});
  },

  hydrate: () => {
    const settings = mmkvStorage.getAllSettings();
    set(settings);
  },
}));
