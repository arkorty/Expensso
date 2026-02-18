import {Category, ExchangeRates, PaymentMethod} from '../types';

// ─── Default Expense Categories (Indian Context) ────────────────────

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  {name: 'Rent', icon: 'home', color: '#E74C3C', type: 'expense', isDefault: true},
  {name: 'Groceries', icon: 'cart', color: '#2ECC71', type: 'expense', isDefault: true},
  {name: 'Fuel', icon: 'gas-station', color: '#F39C12', type: 'expense', isDefault: true},
  {name: 'Domestic Help', icon: 'account-group', color: '#9B59B6', type: 'expense', isDefault: true},
  {name: 'Tiffin', icon: 'food', color: '#E67E22', type: 'expense', isDefault: true},
  {name: 'Utilities', icon: 'lightning-bolt', color: '#3498DB', type: 'expense', isDefault: true},
  {name: 'Mobile Recharge', icon: 'cellphone', color: '#1ABC9C', type: 'expense', isDefault: true},
  {name: 'Transport', icon: 'bus', color: '#34495E', type: 'expense', isDefault: true},
  {name: 'Shopping', icon: 'shopping', color: '#E91E63', type: 'expense', isDefault: true},
  {name: 'Medical', icon: 'hospital-box', color: '#F44336', type: 'expense', isDefault: true},
  {name: 'Education', icon: 'school', color: '#673AB7', type: 'expense', isDefault: true},
  {name: 'Entertainment', icon: 'movie', color: '#FF9800', type: 'expense', isDefault: true},
  {name: 'Dining Out', icon: 'silverware-fork-knife', color: '#795548', type: 'expense', isDefault: true},
  {name: 'Subscriptions', icon: 'television-play', color: '#607D8B', type: 'expense', isDefault: true},
  {name: 'Insurance', icon: 'shield-check', color: '#4CAF50', type: 'expense', isDefault: true},
  {name: 'Other', icon: 'dots-horizontal', color: '#95A5A6', type: 'expense', isDefault: true},
];

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  {name: 'Salary', icon: 'briefcase', color: '#27AE60', type: 'income', isDefault: true},
  {name: 'Freelance', icon: 'laptop', color: '#2980B9', type: 'income', isDefault: true},
  {name: 'Investments', icon: 'chart-line', color: '#8E44AD', type: 'income', isDefault: true},
  {name: 'Rental Income', icon: 'home-city', color: '#D35400', type: 'income', isDefault: true},
  {name: 'Dividends', icon: 'cash-multiple', color: '#16A085', type: 'income', isDefault: true},
  {name: 'Other', icon: 'dots-horizontal', color: '#7F8C8D', type: 'income', isDefault: true},
];

// ─── Payment Methods ─────────────────────────────────────────────────

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Digital Wallet',
  'Net Banking',
  'Other',
];

// ─── Static Exchange Rates (fallback) ────────────────────────────────

export const STATIC_EXCHANGE_RATES: ExchangeRates = {
  INR: 1,
  USD: 84.5, // 1 USD = 84.5 INR
  EUR: 91.2, // 1 EUR = 91.2 INR
};

// ─── Currency Symbols ────────────────────────────────────────────────

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

// ─── Theme Colors ────────────────────────────────────────────────────

export const COLORS = {
  primary: '#0A84FF',
  primaryDark: '#0066CC',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#5AC8FA',

  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceVariant: '#F8F9FA',
  card: '#FFFFFF',

  text: '#000000',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',

  income: '#34C759',
  expense: '#FF3B30',
  asset: '#0A84FF',
  liability: '#FF9500',

  chartColors: [
    '#0A84FF', '#34C759', '#FF9500', '#FF3B30',
    '#5856D6', '#AF52DE', '#FF2D55', '#5AC8FA',
    '#FFCC00', '#64D2FF',
  ],
};

export const DARK_COLORS: typeof COLORS = {
  primary: '#0A84FF',
  primaryDark: '#409CFF',
  secondary: '#5E5CE6',
  success: '#30D158',
  danger: '#FF453A',
  warning: '#FF9F0A',
  info: '#64D2FF',

  background: '#000000',
  surface: '#1C1C1E',
  surfaceVariant: '#2C2C2E',
  card: '#1C1C1E',

  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#636366',
  textInverse: '#000000',

  border: '#38383A',
  borderLight: '#2C2C2E',
  divider: '#38383A',

  income: '#30D158',
  expense: '#FF453A',
  asset: '#0A84FF',
  liability: '#FF9F0A',

  chartColors: [
    '#0A84FF', '#30D158', '#FF9F0A', '#FF453A',
    '#5E5CE6', '#BF5AF2', '#FF375F', '#64D2FF',
    '#FFD60A', '#64D2FF',
  ],
};

// ─── Date Formats ────────────────────────────────────────────────────

export const DATE_FORMATS = {
  display: 'DD MMM YYYY',
  displayShort: 'DD MMM',
  month: 'MMM YYYY',
  iso: 'YYYY-MM-DD',
  time: 'hh:mm A',
  full: 'DD MMM YYYY, hh:mm A',
};
