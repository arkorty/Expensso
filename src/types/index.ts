// ─── Core Domain Types ───────────────────────────────────────────────

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export type PaymentMethod = 'UPI' | 'Cash' | 'Credit Card' | 'Debit Card' | 'Digital Wallet' | 'Net Banking' | 'Other';

export type AssetType = 'Bank' | 'Stocks' | 'Gold' | 'EPF' | 'Real Estate' | 'Mutual Funds' | 'Fixed Deposit' | 'PPF' | 'Other';

export type LiabilityType = 'Home Loan' | 'Car Loan' | 'Personal Loan' | 'Education Loan' | 'Credit Card' | 'Other';

export type TransactionType = 'income' | 'expense';
export type NetWorthTargetType = 'asset' | 'liability';
export type ImpactOperation = 'add' | 'subtract';

// ─── Database Models ─────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  paymentMethod: PaymentMethod;
  note: string;
  date: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface TransactionImpact {
  transactionId: string;
  targetType: NetWorthTargetType;
  targetId: string;
  operation: ImpactOperation;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  currentValue: number;
  currency: Currency;
  note: string;
  lastUpdated: string;
  createdAt: string;
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  outstandingAmount: number;
  currency: Currency;
  interestRate: number;
  emiAmount: number;
  note: string;
  lastUpdated: string;
  createdAt: string;
}

// ─── Net Worth ───────────────────────────────────────────────────────

export interface NetWorthSnapshot {
  id: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currency: Currency;
  snapshotDate: string;
  createdAt: string;
}

// ─── Settings ────────────────────────────────────────────────────────

export interface AppSettings {
  baseCurrency: Currency;
  locale: string;
  theme: 'light' | 'dark' | 'black' | 'system';
  biometricEnabled: boolean;
  onboardingComplete: boolean;
}

// ─── Chart Data ──────────────────────────────────────────────────────

export interface ChartDataPoint {
  value: number;
  label: string;
  frontColor?: string;
}

export interface PieDataPoint {
  value: number;
  text: string;
  color: string;
  focused?: boolean;
}

// ─── Exchange Rates ──────────────────────────────────────────────────

export interface ExchangeRates {
  INR: number;
  USD: number;
  EUR: number;
  GBP: number;
}
