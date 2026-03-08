import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { formatCurrency } from '@/lib/calculations';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const COLORS = ['hsl(142 60% 45%)', 'hsl(354 70% 54%)'];

export default function Analytics() {
  const [trades, setTrades] = useState<{ net_pnl: number; brokerage: number; trade_date: string; sentiment: string | null }[]>([]);
  const [violations, setViolations] = useState<{ violation_type: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [tRes, vRes] = await Promise.all([
        supabase.from('trade_entries').select('net_pnl, brokerage, trade_date, sentiment').eq('user_id', user.id).order('trade_date', { ascending: true }),
        supabase.from('violations').select('violation_type').eq('user_id', user.id),
      ]);

      setTrades((tRes.data ?? []) as typeof trades);
      setViolations((vRes.data ?? []) as typeof violations);
      setLoading(false);
    })();
  }, []);

  const monthlyPnl = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach(t => {
      const key = format(new Date(t.trade_date), 'MMM yyyy');
      map[key] = (map[key] || 0) + (t.net_pnl ?? 0);
    });
    return Object.entries(map).map(([month, pnl]) => ({ month, pnl }));
  }, [trades]);

  const winRateData = useMemo(() => {
    const wins = trades.filter(t => (t.net_pnl ?? 0) > 0).length;
    const losses = trades.length - wins;
    return [{ name: 'Wins', value: wins }, { name: 'Losses', value: losses }];
  }, [trades]);

  const winPct = trades.length > 0 ? Math.round((winRateData[0].value / trades.length) * 100) : 0;

  const sentimentPerf = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach(t => {
      const s = t.sentiment || 'Unknown';
      map[s] = (map[s] || 0) + (t.net_pnl ?? 0);
    });
    return Object.entries(map).map(([sentiment, pnl]) => ({ sentiment, pnl }));
  }, [trades]);

  const mistakeFreq = useMemo(() => {
    const map: Record<string, number> = {};
    violations.forEach(v => { map[v.violation_type] = (map[v.violation_type] || 0) + 1; });
    return Object.entries(map).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [violations]);

  const brokerageData = useMemo(() => {
    const map: Record<string, number> = {};
    let cum = 0;
    trades.forEach(t => {
      const key = format(new Date(t.trade_date), 'MMM yyyy');
      cum += t.brokerage ?? 0;
      map[key] = cum;
    });
    return Object.entries(map).map(([month, total]) => ({ month, total }));
  }, [trades]);

  const streaks = useMemo(() => {
    let curWin = 0, curLoss = 0, bestWin = 0, bestLoss = 0;
    trades.forEach(t => {
      if ((t.net_pnl ?? 0) > 0) { curWin++; curLoss = 0; bestWin = Math.max(bestWin, curWin); }
      else { curLoss++; curWin = 0; bestLoss = Math.max(bestLoss, curLoss); }
    });
    return { currentWin: curWin, longestLoss: bestLoss, bestWin };
  }, [trades]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Deep dive into your trading performance</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-72 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const empty = trades.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Deep dive into your trading performance</p>
      </div>

      {empty ? (
        <p className="text-muted-foreground text-sm text-center py-16">No trade data yet. Start logging trades to see analytics!</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* P&L Over Time */}
          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold mb-4">P&L Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPnl}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12, fontFamily: 'DM Mono' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11, fontFamily: 'DM Mono' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 18%)', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }} formatter={(v: number) => [formatCurrency(v), 'P&L']} />
                  <Line type="monotone" dataKey="pnl" stroke="hsl(37 90% 55%)" strokeWidth={2} dot={{ fill: 'hsl(37 90% 55%)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Win Rate */}
          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold mb-4">Win Rate</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={winRateData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" startAngle={90} endAngle={-270}>
                    {winRateData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="hsl(210 20% 90%)" fontFamily="DM Mono" fontSize="24" fontWeight="bold">{winPct}%</text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-profit" /> Wins ({winRateData[0].value})</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-loss" /> Losses ({winRateData[1].value})</div>
            </div>
          </div>

          {/* Sentiment Performance */}
          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold mb-4">Sentiment Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentPerf} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11, fontFamily: 'DM Mono' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="sentiment" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12 }} width={70} />
                  <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 18%)', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }} formatter={(v: number) => [formatCurrency(v), 'P&L']} />
                  <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                    {sentimentPerf.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? 'hsl(142 60% 45%)' : 'hsl(354 70% 54%)'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mistake Frequency */}
          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold mb-4">Most Common Mistakes</h3>
            <div className="h-64">
              {mistakeFreq.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-16">No violations recorded 🎉</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mistakeFreq} layout="vertical">
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11, fontFamily: 'DM Mono' }} />
                    <YAxis type="category" dataKey="type" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} width={110} />
                    <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 18%)', borderRadius: 8 }} />
                    <Bar dataKey="count" fill="hsl(37 90% 55%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Brokerage Drain */}
          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-heading font-semibold mb-4">Cumulative Brokerage Paid</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={brokerageData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 12, fontFamily: 'DM Mono' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11, fontFamily: 'DM Mono' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 18%)', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }} formatter={(v: number) => [formatCurrency(v), 'Total Brokerage']} />
                  <Line type="monotone" dataKey="total" stroke="hsl(354 70% 54%)" strokeWidth={2} dot={{ fill: 'hsl(354 70% 54%)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Streak Tracker */}
          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-heading font-semibold mb-4">Streak Tracker</h3>
            <div className="flex gap-6">
              <div className="flex-1 text-center p-6 rounded-lg bg-profit/10 border border-profit/20">
                <div className="font-mono text-3xl font-bold text-profit">{streaks.currentWin}</div>
                <div className="text-sm text-muted-foreground mt-1">Current Win Streak</div>
              </div>
              <div className="flex-1 text-center p-6 rounded-lg bg-loss/10 border border-loss/20">
                <div className="font-mono text-3xl font-bold text-loss">{streaks.longestLoss}</div>
                <div className="text-sm text-muted-foreground mt-1">Longest Loss Streak</div>
              </div>
              <div className="flex-1 text-center p-6 rounded-lg bg-primary/10 border border-primary/20">
                <div className="font-mono text-3xl font-bold text-primary">{streaks.bestWin}</div>
                <div className="text-sm text-muted-foreground mt-1">Best Win Streak</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
