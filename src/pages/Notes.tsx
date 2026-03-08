import { useState, useEffect } from 'react';
import { formatTradeDate } from '@/lib/calculations';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { MOODS } from '@/types/trade';

function getMoodEmoji(mood: string): string {
  return MOODS.find(m => m.value === mood)?.emoji || '😐';
}

export default function Notes() {
  const [notes, setNotes] = useState<{ id: string; trade_date: string; instrument: string; mood: string | null; notes: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('trade_entries')
        .select('id, trade_date, instrument, mood, notes')
        .eq('user_id', user.id)
        .not('notes', 'is', null)
        .order('trade_date', { ascending: false });

      setNotes(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Trading Notes</h1>
        <p className="text-muted-foreground text-sm">Your observations and lessons learned</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
        ) : notes.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-12">No notes yet. Add notes when logging trades!</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="glass-card p-5 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{formatTradeDate(note.trade_date)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{note.instrument}</span>
                </div>
                <span className="text-xl" title={note.mood ?? ''}>{getMoodEmoji(note.mood ?? '')}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{note.notes}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
