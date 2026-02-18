import {Currency} from '../types';
import {CURRENCY_SYMBOLS, STATIC_EXCHANGE_RATES} from '../constants';

/**
 * Formats a number in Indian Lakh/Crore notation.
 * e.g., 1500000 → "15,00,000"
 */
export function formatIndianNumber(num: number): string {
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const [intPart, decPart] = absNum.toFixed(2).split('.');

  if (intPart.length <= 3) {
    const formatted = intPart + (decPart && decPart !== '00' ? '.' + decPart : '');
    return isNegative ? '-' + formatted : formatted;
  }

  // Last 3 digits
  const lastThree = intPart.slice(-3);
  const remaining = intPart.slice(0, -3);

  // Group remaining digits in pairs (Indian system)
  const pairs = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  const formatted =
    pairs + ',' + lastThree + (decPart && decPart !== '00' ? '.' + decPart : '');
  return isNegative ? '-' + formatted : formatted;
}

/**
 * Formats a number in Western notation (comma every 3 digits).
 */
export function formatWesternNumber(num: number): string {
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const [intPart, decPart] = absNum.toFixed(2).split('.');
  const formatted =
    intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
    (decPart && decPart !== '00' ? '.' + decPart : '');
  return isNegative ? '-' + formatted : formatted;
}

/**
 * Formats amount with currency symbol and locale-aware grouping.
 */
export function formatCurrency(amount: number, currency: Currency = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const formatted =
    currency === 'INR'
      ? formatIndianNumber(amount)
      : formatWesternNumber(amount);
  return `${symbol}${formatted}`;
}

/**
 * Compact formatting for large values on charts/cards.
 * e.g., 1500000 → "₹15L", 25000000 → "₹2.5Cr"
 */
export function formatCompact(amount: number, currency: Currency = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (currency === 'INR') {
    if (abs >= 1_00_00_000) {
      return `${sign}${symbol}${(abs / 1_00_00_000).toFixed(1).replace(/\.0$/, '')}Cr`;
    }
    if (abs >= 1_00_000) {
      return `${sign}${symbol}${(abs / 1_00_000).toFixed(1).replace(/\.0$/, '')}L`;
    }
    if (abs >= 1_000) {
      return `${sign}${symbol}${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return `${sign}${symbol}${abs}`;
  }

  // Western compact
  if (abs >= 1_000_000_000) {
    return `${sign}${symbol}${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${symbol}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${symbol}${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `${sign}${symbol}${abs}`;
}

/**
 * Convert an amount from one currency to another using static rates
 * (all rates are relative to INR as base).
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
): number {
  if (from === to) {return amount;}
  // Convert to INR first, then to target
  const amountInINR = amount * STATIC_EXCHANGE_RATES[from];
  return amountInINR / STATIC_EXCHANGE_RATES[to];
}

/**
 * Calculate percentage change between two values.
 */
export function percentageChange(current: number, previous: number): number {
  if (previous === 0) {return current > 0 ? 100 : 0;}
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Generate a simple UUID v4 string.
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
