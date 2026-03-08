import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { formatCurrency } from '@/lib/calculations';

const monthlyPnl = [
  { month: 'Oct', pnl: 34500 }, { month: 'Nov', pnl: -12300 }, { month: 'Dec', pnl: 28700 },
  { month: 'Jan', pnl: 45200 }, { month: 'Feb', pnl: -8900 }, { month: 'Mar', pnl: 34500 },
];

const winRateData = [
  { name: 'Wins', value: 65 },
  { name: 'Losses', value: 35 },
];

const sentimentPerf = [
  { sentiment: 'Bullish', pnl: 42000 },
  { sentiment: 'Bearish', pnl: -8500 },
  { sentiment: 'Sideways', pnl: 3200 },
  { sentiment: 'Neutral', pnl: -2100 },
  { sentiment: 'Volatile', pnl: 18000 },
];

const mistakeFreq = [
  { type: 'FOMO entry', count: 8 },
  { type: 'Broke stop loss', count: 6 },
  { type: 'Overtraded', count: 5 },
  { type: 'Revenge traded', count: 4 },
  { type: 'Exited too early', count: 3 },
];

const brokerageData = [
  { month: 'Oct', total: 4200 }, { month: 'Nov', total: 8100 }, { month: 'Dec', total: 12400 },
  { month: 'Jan', total: 17300 }, { month: 'Feb', total: 21000 }, { month: 'Mar', total: 24800 },
];

const COLORS = ['hsl(142 60% 45%)', 'hsl(354 70% 54%)'];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Deep dive into your trading performance</p>
      </div>

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
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="hsl(210 20% 90%)" fontFamily="DM Mono" fontSize="24" fontWeight="bold">65%</text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-profit" /> Wins (65)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-loss" /> Losses (35)</div>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mistakeFreq} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11, fontFamily: 'DM Mono' }} />
                <YAxis type="category" dataKey="type" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215 15% 55%)', fontSize: 11 }} width={110} />
                <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 18%)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(37 90% 55%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
              <div className="font-mono text-3xl font-bold text-profit">4</div>
              <div className="text-sm text-muted-foreground mt-1">Current Win Streak</div>
            </div>
            <div className="flex-1 text-center p-6 rounded-lg bg-loss/10 border border-loss/20">
              <div className="font-mono text-3xl font-bold text-loss">2</div>
              <div className="text-sm text-muted-foreground mt-1">Longest Loss Streak</div>
            </div>
            <div className="flex-1 text-center p-6 rounded-lg bg-primary/10 border border-primary/20">
              <div className="font-mono text-3xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground mt-1">Best Win Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
