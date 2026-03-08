import { useMemo, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Target, Activity, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency, getPnlColor, formatTradeDate, calculateWinRate } from '@/lib/calculations';
import { useStockPrices, type StockQuote } from '@/hooks/useStockPrices';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import type { TradeEntry } from '@/types/trade';

function formatINR(value: number | null | undefined): string {
  if (value == null) return '—';
  return '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function IndexCard({ quote, isLoading }: { quote?: StockQuote; isLoading: boolean }) {
  if (isLoading || !quote) {
    return (
      <div className="glass-card p-5 animate-fade-in">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  const isUp = quote.change >= 0;

  return (
    <div className="glass-card p-5 animate-fade-in group hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
          {quote.exchange} • {quote.name}
        </span>
        <div className={`w-2 h-2 rounded-full ${quote.marketState === 'REGULAR' ? 'bg-profit animate-pulse' : 'bg-muted-foreground'}`} />
      </div>
      <div className={`font-mono text-2xl font-bold ${isUp ? 'text-profit' : 'text-loss'}`}>
        {formatINR(quote.price)}
      </div>
      <div className="flex items-center gap-2 mt-1">
        {isUp ? <TrendingUp className="w-3.5 h-3.5 text-profit" /> : <TrendingDown className="w-3.5 h-3.5 text-loss" />}
        <span className={`text-xs font-mono ${isUp ? 'text-profit' : 'text-loss'}`}>
          {isUp ? '+' : ''}{quote.change?.toFixed(2)} ({isUp ? '+' : ''}{quote.changePercent?.toFixed(2)}%)
        </span>
      </div>
      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-mono">
        <span>H: {formatINR(quote.dayHigh)}</span>
        <span>L: {formatINR(quote.dayLow)}</span>
        <span>Prev: {formatINR(quote.previousClose)}</span>
      </div>
    </div>
  );
}

function StockRow({ stock }: { stock: StockQuote }) {
  const isUp = stock.change >= 0;
  return (
    <tr className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
      <td className="py-2.5 font-medium text-sm">{stock.name}</td>
      <td className="py-2.5 font-mono text-xs text-muted-foreground">{stock.symbol.replace('.NS', '')}</td>
      <td className={`py-2.5 text-right font-mono text-sm font-medium ${isUp ? 'text-profit' : 'text-loss'}`}>
        {formatINR(stock.price)}
      </td>
      <td className={`py-2.5 text-right font-mono text-xs ${isUp ? 'text-profit' : 'text-loss'}`}>
        {isUp ? '+' : ''}{stock.change?.toFixed(2)}
      </td>
      <td className={`py-2.5 text-right font-mono text-xs ${isUp ? 'text-profit' : 'text-loss'}`}>
        {isUp ? '+' : ''}{stock.changePercent?.toFixed(2)}%
      </td>
      <td className="py-2.5 text-right font-mono text-xs text-muted-foreground">
        {stock.volume ? (stock.volume / 100000).toFixed(1) + 'L' : '—'}
      </td>
    </tr>
  );
}

function KPICard({ icon: Icon, label, value, subtext, trend }: { icon: any; label: string; value: string; subtext?: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div className={`font-mono text-2xl font-bold ${trend === 'up' ? 'text-profit' : trend === 'down' ? 'text-loss' : ''}`}>
        {value}
      </div>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { data: stockData, isLoading: stocksLoading, isError, refetch, dataUpdatedAt } = useStockPrices(30000);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [tradesLoading, setTradesLoading] = useState(true);

  useEffect(() => {
    async function loadTrades() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTradesLoading(false); return; }

      const { data } = await supabase
        .from('trade_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('trade_date', { ascending: false })
        .limit(20);

      if (data) setTrades(data as unknown as TradeEntry[]);
      setTradesLoading(false);
    }
    loadTrades();
  }, []);

  const totalPnl = trades.reduce((sum, t) => sum + (t.net_pnl || 0), 0);
  const totalBrokerage = trades.reduce((sum, t) => sum + (t.brokerage || 0), 0);
  const winRate = calculateWinRate(trades.filter(t => t.net_pnl !== undefined && t.net_pnl !== null) as { net_pnl: number }[]);

  const weeklyData = useMemo(() => {
    const last7 = trades.slice(0, 7).reverse();
    return last7.map(t => ({
      day: t.trade_date ? new Date(t.trade_date).toLocaleDateString('en-IN', { weekday: 'short' }) : '—',
      pnl: t.net_pnl || 0,
    }));
  }, [trades]);

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN') : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Live market data & your trading overview</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[10px] font-mono text-muted-foreground">
              Updated {lastUpdated}
            </span>
          )}
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
            title="Refresh prices"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${stocksLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-1.5">
            {isError ? (
              <WifiOff className="w-3.5 h-3.5 text-loss" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-profit" />
            )}
            <span className={`text-[10px] font-mono ${isError ? 'text-loss' : 'text-profit'}`}>
              {isError ? 'OFFLINE' : 'LIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* SENSEX & NIFTY Index Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IndexCard quote={stockData?.indices?.find(i => i.name === 'SENSEX')} isLoading={stocksLoading} />
        <IndexCard quote={stockData?.indices?.find(i => i.name === 'NIFTY 50')} isLoading={stocksLoading} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} label="Total P&L" value={trades.length ? formatCurrency(totalPnl) : '—'} trend={totalPnl >= 0 ? 'up' : 'down'} subtext="Your trades" />
        <KPICard icon={BarChart3} label="Total Brokerage" value={trades.length ? formatCurrency(totalBrokerage) : '—'} trend="neutral" subtext="Hidden costs" />
        <KPICard icon={Target} label="Win Rate" value={trades.length ? `${winRate}%` : '—'} trend={winRate >= 50 ? 'up' : 'down'} subtext={trades.length ? `${trades.filter(t => t.net_pnl > 0).length}W / ${trades.filter(t => t.net_pnl <= 0).length}L` : 'No trades yet'} />
        <KPICard icon={Activity} label="Total Trades" value={String(trades.length)} trend="neutral" subtext="Logged" />
      </div>

      {/* Chart + Stocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly P&L Chart */}
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold mb-4">Recent P&L</h3>
          {weeklyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12, fontFamily: 'DM Mono' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11, fontFamily: 'DM Mono' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 18%)', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }}
                    formatter={(v: number) => [formatCurrency(v), 'P&L']}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {weeklyData.map((entry, i) => (
                      <Cell key={i} fill={entry.pnl >= 0 ? 'hsl(142 60% 45%)' : 'hsl(354 70% 54%)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No trade data yet. Start logging trades to see your P&L chart.
            </div>
          )}
        </div>

        {/* Indian Stocks Live Prices */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">Indian Stocks — Live</h3>
            <span className="text-[10px] font-mono text-muted-foreground">NSE</span>
          </div>
          <div className="overflow-auto max-h-72">
            {stocksLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : stockData?.stocks?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Symbol</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Chg</th>
                    <th className="text-right py-2">%</th>
                    <th className="text-right py-2">Vol</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.stocks.map(s => (
                    <StockRow key={s.symbol} stock={s} />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Unable to fetch stock data. Try refreshing.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      {trades.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold mb-4">Recent Trades</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Instrument</th>
                  <th className="text-left py-2">Sentiment</th>
                  <th className="text-right py-2">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 7).map(t => (
                  <tr key={t.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-2.5 font-mono text-xs">{formatTradeDate(t.trade_date)}</td>
                    <td className="py-2.5 font-medium">{t.instrument}</td>
                    <td className="py-2.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{t.sentiment}</span>
                    </td>
                    <td className={`py-2.5 text-right font-mono font-medium ${getPnlColor(t.net_pnl)}`}>
                      {formatCurrency(t.net_pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
