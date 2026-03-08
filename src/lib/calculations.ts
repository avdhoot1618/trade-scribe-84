import { format, getDay } from 'date-fns';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getDayFromDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return DAYS[getDay(d)];
}

export function calculateGrossPnl(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  tradeType: 'Long' | 'Short'
): number {
  if (tradeType === 'Long') return (exitPrice - entryPrice) * quantity;
  return (entryPrice - exitPrice) * quantity;
}

export function calculateNetPnl(grossPnl: number, brokerage: number): number {
  return grossPnl - brokerage;
}

export function calculateWinRate(trades: { net_pnl: number }[]): number {
  if (trades.length === 0) return 0;
  const wins = trades.filter(t => t.net_pnl > 0).length;
  return Math.round((wins / trades.length) * 100);
}

export function formatCurrency(value: number, currency = '₹'): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${value < 0 ? '-' : ''}${currency}${formatted}`;
}

export function getPnlColor(value: number): string {
  if (value > 0) return 'text-profit';
  if (value < 0) return 'text-loss';
  return 'text-muted-foreground';
}

export function formatTradeDate(date: string): string {
  return format(new Date(date), 'dd MMM yyyy');
}
