import { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Target, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency, getPnlColor, formatTradeDate, calculateWinRate } from '@/lib/calculations';
import type { TradeEntry } from '@/types/trade';

// Mock data for initial display
const MOCK_TRADES: Partial<TradeEntry>[] = [
  { id: '1', trade_date: '2026-03-01', instrument: 'NIFTY 50', sentiment: 'Bullish', executed_quantity: 50, net_pnl: 12500, brokerage: 340, gross_pnl: 12840 },
  { id: '2', trade_date: '2026-03-02', instrument: 'RELIANCE', sentiment: 'Bearish', executed_quantity: 25, net_pnl: -4200, brokerage: 180, gross_pnl: -4020 },
  { id: '3', trade_date: '2026-03-03', instrument: 'BANKNIFTY', sentiment: 'Volatile', executed_quantity: 75, net_pnl: 8900, brokerage: 420, gross_pnl: 9320 },
  { id: '4', trade_date: '2026-03-04', instrument: 'TCS', sentiment: 'Neutral', executed_quantity: 30, net_pnl: -1500, brokerage: 150, gross_pnl: -1350 },
  { id: '5', trade_date: '2026-03-05', instrument: 'HDFC BANK', sentiment: 'Bullish', executed_quantity: 40, net_pnl: 6700, brokerage: 280, gross_pnl: 6980 },
  { id: '6', trade_date: '2026-03-06', instrument: 'INFY', sentiment: 'Bearish', executed_quantity: 60, net_pnl: -3200, brokerage: 210, gross_pnl: -2990 },
  { id: '7', trade_date: '2026-03-07', instrument: 'NIFTY 50', sentiment: 'Bullish', executed_quantity: 50, net_pnl: 15300, brokerage: 350, gross_pnl: 15650 },
];

const weeklyData = [
  { day: 'Mon', pnl: 12500 },
  { day: 'Tue', pnl: -4200 },
  { day: 'Wed', pnl: 8900 },
  { day: 'Thu', pnl: -1500 },
  { day: 'Fri', pnl: 6700 },
  { day: 'Sat', pnl: -3200 },
  { day: 'Sun', pnl: 15300 },
];

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
  const trades = MOCK_TRADES as TradeEntry[];
  const totalPnl = trades.reduce((sum, t) => sum + (t.net_pnl || 0), 0);
  const totalBrokerage = trades.reduce((sum, t) => sum + (t.brokerage || 0), 0);
  const winRate = calculateWinRate(trades);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your trading overview at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} label="Total P&L (This Month)" value={formatCurrency(totalPnl)} trend={totalPnl >= 0 ? 'up' : 'down'} subtext="March 2026" />
        <KPICard icon={BarChart3} label="Total Brokerage" value={formatCurrency(totalBrokerage)} trend="neutral" subtext="Hidden costs" />
        <KPICard icon={Target} label="Win Rate" value={`${winRate}%`} trend={winRate >= 50 ? 'up' : 'down'} subtext={`${trades.filter(t => t.net_pnl > 0).length}W / ${trades.filter(t => t.net_pnl <= 0).length}L`} />
        <KPICard icon={Activity} label="Total Trades" value={String(trades.length)} trend="neutral" subtext="This month" />
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly P&L Chart */}
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold mb-4">Weekly P&L</h3>
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
        </div>

        {/* Recent Trades */}
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
                {trades.map(t => (
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
      </div>
    </div>
  );
}
