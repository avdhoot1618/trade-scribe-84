import { useState, useEffect, useMemo } from 'react';
import { formatTradeDate } from '@/lib/calculations';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import type { Violation } from '@/types/trade';

function getSeverityColor(severity: string) {
  if (severity === 'High') return 'text-loss';
  if (severity === 'Medium') return 'text-primary';
  return 'text-muted-foreground';
}

export default function Violations() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [dailyPnl, setDailyPnl] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

    const [vRes, tRes] = await Promise.all([
      supabase.from('violations').select('*').eq('user_id', user.id).order('violation_date', { ascending: false }),
      supabase.from('trade_entries').select('trade_date, net_pnl').eq('user_id', user.id).gte('trade_date', startDate).lte('trade_date', endDate),
    ]);

    if (vRes.error) {
      toast({ title: 'Error', description: vRes.error.message, variant: 'destructive' });
    } else {
      setViolations((vRes.data ?? []) as Violation[]);
    }

    // Aggregate daily P&L
    const pnlMap: Record<number, number> = {};
    (tRes.data ?? []).forEach((t: any) => {
      const day = new Date(t.trade_date).getDate();
      pnlMap[day] = (pnlMap[day] || 0) + (t.net_pnl ?? 0);
    });
    setDailyPnl(pnlMap);

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('violations').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting', description: error.message, variant: 'destructive' });
    } else {
      setViolations(prev => prev.filter(v => v.id !== id));
      toast({ title: 'Violation deleted' });
    }
  };

  const topViolations = useMemo(() => {
    const counts: Record<string, number> = {};
    violations.forEach(v => { counts[v.violation_type] = (counts[v.violation_type] || 0) + 1; });
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [violations]);

  const maxCount = topViolations[0]?.count ?? 1;

  // Calendar data for current month
  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const pnl = dailyPnl[day];
      return { day, pnl, isPast: day <= today };
    });
  }, [dailyPnl]);

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Mistakes & Violations</h1>
          <p className="text-muted-foreground text-sm">Track discipline and build better habits</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Mistakes & Violations</h1>
        <p className="text-muted-foreground text-sm">Track discipline and build better habits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Violations */}
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold mb-4">Top 5 This Month</h3>
          {topViolations.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No violations yet 🎉</p>
          ) : (
            <div className="space-y-3">
              {topViolations.map((v, i) => (
                <div key={v.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground w-4">#{i + 1}</span>
                    <span className="text-sm">{v.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-primary/30 rounded-full" style={{ width: `${(v.count / maxCount) * 80}px` }} />
                    <span className="font-mono text-xs text-muted-foreground">{v.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* P&L Calendar */}
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold mb-4">{monthLabel}</h3>
          <div className="grid grid-cols-7 gap-1.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground py-1">{d}</div>
            ))}
            {calendarData.map(d => (
              <div
                key={d.day}
                className={`aspect-square rounded-sm flex items-center justify-center text-xs font-mono ${
                  d.pnl != null && d.pnl > 0
                    ? 'bg-profit/20 text-profit'
                    : d.pnl != null && d.pnl < 0
                    ? 'bg-loss/20 text-loss'
                    : d.isPast
                    ? 'bg-secondary/30 text-muted-foreground/50'
                    : 'bg-secondary/10 text-muted-foreground/20'
                }`}
              >
                {d.day}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-profit/20" /> Profit</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-loss/20" /> Loss</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-secondary/30" /> No trades</div>
          </div>
        </div>
      </div>

      {/* Violations Log */}
      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold mb-4">Violations Log</h3>
        {violations.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No violations recorded. Keep up the discipline!</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Violation</th>
                <th className="text-left py-2">Severity</th>
                <th className="text-left py-2">Notes</th>
                <th className="text-right py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {violations.map(v => (
                <tr key={v.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="py-2.5 font-mono text-xs">{v.violation_date ? formatTradeDate(v.violation_date) : '—'}</td>
                  <td className="py-2.5">{v.violation_type}</td>
                  <td className={`py-2.5 font-medium text-xs ${getSeverityColor(v.severity ?? '')}`}>{v.severity ?? '—'}</td>
                  <td className="py-2.5 text-muted-foreground text-xs max-w-xs truncate">{v.violation_notes ?? '—'}</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-xs text-loss hover:text-loss/80 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
