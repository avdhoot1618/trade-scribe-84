import { formatTradeDate } from '@/lib/calculations';

const violationLog = [
  { id: '1', date: '2026-03-07', type: 'FOMO entry', severity: 'High', notes: 'Entered without plan confirmation' },
  { id: '2', date: '2026-03-06', type: 'Broke stop loss', severity: 'High', notes: 'Moved SL hoping for recovery' },
  { id: '3', date: '2026-03-05', type: 'Overtraded', severity: 'Medium', notes: 'Took 8 trades instead of planned 3' },
  { id: '4', date: '2026-03-04', type: 'Revenge traded', severity: 'High', notes: 'Immediately re-entered after loss' },
  { id: '5', date: '2026-03-03', type: 'Exited too early', severity: 'Low', notes: 'Closed at 50% of target' },
  { id: '6', date: '2026-03-01', type: 'FOMO entry', severity: 'Medium', notes: 'Saw movement and jumped in' },
];

const topViolations = [
  { type: 'FOMO entry', count: 8 },
  { type: 'Broke stop loss', count: 6 },
  { type: 'Overtraded', count: 5 },
  { type: 'Revenge traded', count: 4 },
  { type: 'Exited too early', count: 3 },
];

// Generate calendar data for current month
const calendarDays = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const hasViolation = [1, 3, 4, 5, 6, 7].includes(day);
  return { day, hasViolation };
});

function getSeverityColor(severity: string) {
  if (severity === 'High') return 'text-loss';
  if (severity === 'Medium') return 'text-primary';
  return 'text-muted-foreground';
}

export default function Violations() {
  const improvementScore = 62;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Mistakes & Violations</h1>
        <p className="text-muted-foreground text-sm">Track discipline and build better habits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Improvement Score */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <h3 className="font-heading font-semibold mb-4">Improvement Score</h3>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(222 20% 18%)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={improvementScore >= 70 ? 'hsl(142 60% 45%)' : improvementScore >= 40 ? 'hsl(37 90% 55%)' : 'hsl(354 70% 54%)'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(improvementScore / 100) * 314} 314`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-2xl font-bold">{improvementScore}</span>
            </div>
          </div>
          <p className="text-muted-foreground text-xs mt-3 text-center">Lower violations = higher score</p>
        </div>

        {/* Top 5 Violations */}
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold mb-4">Top 5 This Month</h3>
          <div className="space-y-3">
            {topViolations.map((v, i) => (
              <div key={v.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-4">#{i + 1}</span>
                  <span className="text-sm">{v.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-primary/30 rounded-full" style={{ width: `${(v.count / 8) * 80}px` }} />
                  <span className="font-mono text-xs text-muted-foreground">{v.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Violation Calendar */}
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold mb-4">March 2026</h3>
          <div className="grid grid-cols-7 gap-1.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground py-1">{d}</div>
            ))}
            {/* Offset for March 2026 starting on Sunday */}
            {calendarDays.map(d => (
              <div
                key={d.day}
                className={`aspect-square rounded-sm flex items-center justify-center text-xs font-mono ${
                  d.hasViolation
                    ? 'bg-loss/20 text-loss'
                    : d.day <= 8
                    ? 'bg-profit/10 text-profit/60'
                    : 'bg-secondary/30 text-muted-foreground/30'
                }`}
              >
                {d.day}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-loss/20" /> Violation</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-profit/10" /> Clean</div>
          </div>
        </div>
      </div>

      {/* Violations Log */}
      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold mb-4">Violations Log</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Violation</th>
              <th className="text-left py-2">Severity</th>
              <th className="text-left py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {violationLog.map(v => (
              <tr key={v.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                <td className="py-2.5 font-mono text-xs">{formatTradeDate(v.date)}</td>
                <td className="py-2.5">{v.type}</td>
                <td className={`py-2.5 font-medium text-xs ${getSeverityColor(v.severity)}`}>{v.severity}</td>
                <td className="py-2.5 text-muted-foreground text-xs max-w-xs truncate">{v.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
