import { useState, useMemo } from 'react';
import { format, getDay } from 'date-fns';
import { Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, getPnlColor, formatTradeDate, getDayFromDate } from '@/lib/calculations';
import TradeEntryForm from '@/components/journal/TradeEntryForm';
import type { TradeEntry, Sentiment } from '@/types/trade';

const MOCK_TRADES: TradeEntry[] = [
  { id: '1', user_id: '', trade_date: '2026-03-07', trade_day: 'Saturday', session: 'Regular', instrument: 'NIFTY 50', trade_type: 'Long', sentiment: 'Bullish', entry_price: 22100, exit_price: 22350, target_quantity: 50, executed_quantity: 50, stop_loss: 22000, target_price: 22400, gross_pnl: 12500, brokerage: 340, net_pnl: 12160, mood: 'Confident', notes: 'Strong uptrend, followed the plan.', is_draft: false, created_at: '', updated_at: '' },
  { id: '2', user_id: '', trade_date: '2026-03-06', trade_day: 'Friday', session: 'Regular', instrument: 'RELIANCE', trade_type: 'Short', sentiment: 'Bearish', entry_price: 2480, exit_price: 2520, target_quantity: 30, executed_quantity: 25, stop_loss: 2500, target_price: 2440, gross_pnl: -1000, brokerage: 180, net_pnl: -1180, mood: 'Frustrated', notes: 'Broke stop loss. Need better discipline.', is_draft: false, created_at: '', updated_at: '' },
  { id: '3', user_id: '', trade_date: '2026-03-05', trade_day: 'Thursday', session: 'Pre-Market', instrument: 'BANKNIFTY', trade_type: 'Long', sentiment: 'Volatile', entry_price: 47200, exit_price: 47450, target_quantity: 75, executed_quantity: 75, stop_loss: 47100, target_price: 47500, gross_pnl: 18750, brokerage: 420, net_pnl: 18330, mood: 'Disciplined', notes: 'Caught a nice move in volatile conditions.', is_draft: false, created_at: '', updated_at: '' },
  { id: '4', user_id: '', trade_date: '2026-03-04', trade_day: 'Wednesday', session: 'Regular', instrument: 'TCS', trade_type: 'Long', sentiment: 'Neutral', entry_price: 3850, exit_price: 3800, target_quantity: 30, executed_quantity: 30, stop_loss: 3820, target_price: 3900, gross_pnl: -1500, brokerage: 150, net_pnl: -1650, mood: 'Anxious', notes: 'Market went flat, should have avoided.', is_draft: false, created_at: '', updated_at: '' },
  { id: '5', user_id: '', trade_date: '2026-03-03', trade_day: 'Tuesday', session: 'Regular', instrument: 'HDFC BANK', trade_type: 'Long', sentiment: 'Bullish', entry_price: 1620, exit_price: 1660, target_quantity: 50, executed_quantity: 40, stop_loss: 1600, target_price: 1680, gross_pnl: 1600, brokerage: 280, net_pnl: 1320, mood: 'Confident', notes: 'Good entry but exited too early.', is_draft: false, created_at: '', updated_at: '' },
];

export default function Journal() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredTrades = useMemo(() => {
    if (!search) return MOCK_TRADES;
    return MOCK_TRADES.filter(t => t.instrument.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Trade Journal</h1>
          <p className="text-muted-foreground text-sm">Your complete trading history</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> New Trade
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search instrument..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Trade List */}
      <div className="space-y-3">
        {filteredTrades.map(trade => (
          <div key={trade.id} className="glass-card overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="font-mono text-xs text-muted-foreground w-20 shrink-0">
                  {formatTradeDate(trade.trade_date)}
                </div>
                <div className="font-medium truncate">{trade.instrument}</div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary shrink-0">{trade.sentiment}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 shrink-0">{trade.trade_type}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-mono font-medium ${getPnlColor(trade.net_pnl)}`}>
                  {formatCurrency(trade.net_pnl)}
                </span>
                {expandedId === trade.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>

            {expandedId === trade.id && (
              <div className="px-4 pb-4 border-t border-border/30 pt-4 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Session</span>
                    <p className="font-mono">{trade.session}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Entry / Exit</span>
                    <p className="font-mono">₹{trade.entry_price} → ₹{trade.exit_price}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Qty (Target / Exec)</span>
                    <p className="font-mono">{trade.target_quantity} / {trade.executed_quantity}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Brokerage</span>
                    <p className="font-mono">{formatCurrency(trade.brokerage)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Stop Loss</span>
                    <p className="font-mono">₹{trade.stop_loss}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Target Price</span>
                    <p className="font-mono">₹{trade.target_price}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Gross P&L</span>
                    <p className={`font-mono font-medium ${getPnlColor(trade.gross_pnl)}`}>{formatCurrency(trade.gross_pnl)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Mood</span>
                    <p>{trade.mood || '—'}</p>
                  </div>
                </div>
                {trade.notes && (
                  <div className="mt-4 p-3 bg-secondary/30 rounded-md">
                    <span className="text-muted-foreground text-xs">Notes</span>
                    <p className="text-sm mt-1">{trade.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Trade Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center overflow-auto py-8">
          <div className="w-full max-w-3xl mx-4">
            <TradeEntryForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
