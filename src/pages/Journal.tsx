import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, getPnlColor, formatTradeDate } from '@/lib/calculations';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import TradeEntryForm from '@/components/journal/TradeEntryForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { TradeEntry } from '@/types/trade';

export default function Journal() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTrades = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('trade_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setTrades((data ?? []) as unknown as TradeEntry[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTrades(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('trade_entries').delete().eq('id', deleteId);
    if (error) {
      toast({ title: 'Error deleting trade', description: error.message, variant: 'destructive' });
    } else {
      setTrades(prev => prev.filter(t => t.id !== deleteId));
      toast({ title: 'Trade deleted' });
    }
    setDeleteId(null);
  };

  const filteredTrades = useMemo(() => {
    if (!search) return trades;
    return trades.filter(t => t.instrument.toLowerCase().includes(search.toLowerCase()));
  }, [search, trades]);

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
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
        ) : filteredTrades.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-12">No trades found. Start logging your trades!</p>
        ) : (
          filteredTrades.map(trade => (
            <div key={trade.id} className="glass-card overflow-hidden">
              <div className="w-full p-4 flex items-center justify-between text-left">
                <button
                  onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}
                  className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <div className="font-mono text-xs text-muted-foreground w-20 shrink-0">
                    {formatTradeDate(trade.trade_date)}
                  </div>
                  <div className="font-medium truncate">{trade.instrument}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary shrink-0">{trade.sentiment}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 shrink-0">{trade.trade_type}</span>
                </button>
                <div className="flex items-center gap-4">
                  <span className={`font-mono font-medium ${getPnlColor(trade.net_pnl)}`}>
                    {formatCurrency(trade.net_pnl)}
                  </span>
                  <button
                    onClick={() => setDeleteId(trade.id)}
                    className="text-muted-foreground hover:text-loss transition-colors p-1"
                    title="Delete trade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedId === trade.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

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
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this trade entry and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Trade Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center overflow-auto py-8">
          <div className="w-full max-w-3xl mx-4">
            <TradeEntryForm onClose={() => { setShowForm(false); fetchTrades(); }} />
          </div>
        </div>
      )}
    </div>
  );
}
