export type Sentiment = 'Bullish' | 'Bearish' | 'Sideways' | 'Neutral' | 'Volatile';
export type TradeType = 'Long' | 'Short';
export type Session = 'Pre-Market' | 'Regular' | 'Post-Market';
export type Mood = 'Frustrated' | 'Neutral' | 'Confident' | 'Anxious' | 'Disciplined';
export type Severity = 'Low' | 'Medium' | 'High';

export const VIOLATION_TYPES = [
  'Entered without confirmation',
  'Broke stop loss',
  'Overtraded',
  'Revenge traded',
  'FOMO entry',
  'Ignored the plan',
  'Position size exceeded',
  'Exited too early',
  'Added to a losing trade',
  'Other',
] as const;

export interface TradeEntry {
  id: string;
  user_id: string;
  trade_date: string;
  trade_day: string;
  session: Session;
  instrument: string;
  trade_type: TradeType;
  sentiment: Sentiment;
  entry_price: number;
  exit_price: number;
  target_quantity: number;
  executed_quantity: number;
  stop_loss: number;
  target_price: number;
  gross_pnl: number;
  brokerage: number;
  net_pnl: number;
  mood: Mood | null;
  notes: string | null;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface Violation {
  id: string;
  trade_entry_id: string;
  user_id: string;
  violation_type: string;
  severity: Severity;
  violation_notes: string | null;
  violation_date: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  default_brokerage: number;
  currency: string;
  timezone: string;
  created_at: string;
}

export const SENTIMENTS: { value: Sentiment; emoji: string; label: string }[] = [
  { value: 'Bullish', emoji: '🐂', label: 'Bullish' },
  { value: 'Bearish', emoji: '🐻', label: 'Bearish' },
  { value: 'Sideways', emoji: '↔️', label: 'Sideways' },
  { value: 'Neutral', emoji: '🌫️', label: 'Neutral' },
  { value: 'Volatile', emoji: '⚡', label: 'Volatile' },
];

export const MOODS: { value: Mood; emoji: string }[] = [
  { value: 'Frustrated', emoji: '😤' },
  { value: 'Neutral', emoji: '😐' },
  { value: 'Confident', emoji: '😎' },
  { value: 'Anxious', emoji: '😰' },
  { value: 'Disciplined', emoji: '🧘' },
];
