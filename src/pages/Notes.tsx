import { formatTradeDate } from '@/lib/calculations';
import { MOODS } from '@/types/trade';

const mockNotes = [
  { id: '1', date: '2026-03-07', instrument: 'NIFTY 50', mood: 'Confident', notes: 'Strong uptrend day. Followed the plan perfectly — entered on pullback to VWAP and exited at resistance. Market sentiment was clearly bullish with FII buying supporting the move.' },
  { id: '2', date: '2026-03-06', instrument: 'RELIANCE', mood: 'Frustrated', notes: 'Broke my own stop loss rule. Moved SL lower hoping for recovery — classic mistake. Need to accept that losses are part of the game. Should have stuck to the original plan.' },
  { id: '3', date: '2026-03-05', instrument: 'BANKNIFTY', mood: 'Disciplined', notes: 'Volatile session but managed risk well. Took only planned entries and let the market come to me. Profit came from patience, not prediction.' },
  { id: '4', date: '2026-03-04', instrument: 'TCS', mood: 'Anxious', notes: 'Market was flat and choppy. Should have recognized the conditions and stayed out. Lost small but the real cost was mental energy spent on a low-probability setup.' },
  { id: '5', date: '2026-03-03', instrument: 'HDFC BANK', mood: 'Confident', notes: 'Good entry at support level. However, exited too early — took 50% of the move instead of letting the winner run. Need to work on exit strategy.' },
];

function getMoodEmoji(mood: string): string {
  return MOODS.find(m => m.value === mood)?.emoji || '😐';
}

export default function Notes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Trading Notes</h1>
        <p className="text-muted-foreground text-sm">Your observations and lessons learned</p>
      </div>

      <div className="space-y-4">
        {mockNotes.map(note => (
          <div key={note.id} className="glass-card p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">{formatTradeDate(note.date)}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{note.instrument}</span>
              </div>
              <span className="text-xl" title={note.mood}>{getMoodEmoji(note.mood)}</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">{note.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
