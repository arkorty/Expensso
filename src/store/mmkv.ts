import {createMMKV, type MMKV} from 'react-native-mmkv';
import {AppSettings, Currency} from '../types';

let _storage: MMKV | null = null;

function getStorage(): MMKV {
  if (!_storage) {
    _storage = createMMKV({id: 'expensso-settings'});
  }
  return _storage;
}

// ─── Keys ────────────────────────────────────────────────────────────

const KEYS = {
  BASE_CURRENCY: 'settings.baseCurrency',
  LOCALE: 'settings.locale',
  THEME: 'settings.theme',
  BIOMETRIC: 'settings.biometricEnabled',
  ONBOARDING: 'settings.onboardingComplete',
} as const;

// ─── Typed Getters / Setters ─────────────────────────────────────────

export const mmkvStorage = {
  getBaseCurrency: (): Currency => {
    return (getStorage().getString(KEYS.BASE_CURRENCY) as Currency) || 'INR';
  },
  setBaseCurrency: (currency: Currency) => {
    getStorage().set(KEYS.BASE_CURRENCY, currency);
  },

  getLocale: (): string => {
    return getStorage().getString(KEYS.LOCALE) || 'en';
  },
  setLocale: (locale: string) => {
    getStorage().set(KEYS.LOCALE, locale);
  },

  getTheme: (): 'light' | 'dark' | 'black' | 'system' => {
    return (getStorage().getString(KEYS.THEME) as AppSettings['theme']) || 'light';
  },
  setTheme: (theme: AppSettings['theme']) => {
    getStorage().set(KEYS.THEME, theme);
  },

  getBiometric: (): boolean => {
    return getStorage().getBoolean(KEYS.BIOMETRIC) || false;
  },
  setBiometric: (enabled: boolean) => {
    getStorage().set(KEYS.BIOMETRIC, enabled);
  },

  getOnboardingComplete: (): boolean => {
    return getStorage().getBoolean(KEYS.ONBOARDING) || false;
  },
  setOnboardingComplete: (complete: boolean) => {
    getStorage().set(KEYS.ONBOARDING, complete);
  },

  getAllSettings: (): AppSettings => ({
    baseCurrency: mmkvStorage.getBaseCurrency(),
    locale: mmkvStorage.getLocale(),
    theme: mmkvStorage.getTheme(),
    biometricEnabled: mmkvStorage.getBiometric(),
    onboardingComplete: mmkvStorage.getOnboardingComplete(),
  }),

  clearAll: () => {
    getStorage().clearAll();
  },
};
