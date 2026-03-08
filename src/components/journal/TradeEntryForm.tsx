import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { getDayFromDate, calculateGrossPnl, calculateNetPnl, formatCurrency, getPnlColor } from '@/lib/calculations';
import { SENTIMENTS, MOODS, VIOLATION_TYPES, type Sentiment, type TradeType, type Session, type Mood, type Severity } from '@/types/trade';

export default function TradeEntryForm({ onClose }: { onClose: () => void }) {
  const [tradeDate, setTradeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [session, setSession] = useState<Session>('Regular');
  const [instrument, setInstrument] = useState('');
  const [tradeType, setTradeType] = useState<TradeType>('Long');
  const [sentiment, setSentiment] = useState<Sentiment>('Neutral');
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [exitPrice, setExitPrice] = useState<number>(0);
  const [targetQty, setTargetQty] = useState<number>(0);
  const [executedQty, setExecutedQty] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [brokerage, setBrokerage] = useState<number>(0);
  const [mood, setMood] = useState<Mood | ''>('');
  const [notes, setNotes] = useState('');
  const [violations, setViolations] = useState<string[]>([]);
  const [severity, setSeverity] = useState<Severity>('Low');
  const [violationNotes, setViolationNotes] = useState('');

  const grossPnl = useMemo(() => calculateGrossPnl(entryPrice, exitPrice, executedQty, tradeType), [entryPrice, exitPrice, executedQty, tradeType]);
  const netPnl = useMemo(() => calculateNetPnl(grossPnl, brokerage), [grossPnl, brokerage]);
  const tradeDay = useMemo(() => getDayFromDate(tradeDate), [tradeDate]);

  const [saving, setSaving] = useState(false);

  const handleSave = async (isDraft = false) => {
    if (!instrument) { toast.error('Instrument is required'); return; }
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('You must be logged in'); setSaving(false); return; }

    const tradeData = {
      user_id: user.id,
      trade_date: tradeDate,
      trade_day: tradeDay,
      session,
      instrument,
      trade_type: tradeType,
      sentiment,
      entry_price: entryPrice || null,
      exit_price: exitPrice || null,
      target_quantity: targetQty || null,
      executed_quantity: executedQty || null,
      stop_loss: stopLoss || null,
      target_price: targetPrice || null,
      gross_pnl: grossPnl,
      brokerage: brokerage || 0,
      net_pnl: netPnl,
      mood: mood || null,
      notes: notes || null,
      is_draft: isDraft,
    };

    const { data: insertedTrade, error } = await supabase
      .from('trade_entries')
      .insert(tradeData)
      .select()
      .single();

    if (error) {
      toast.error('Failed to save trade: ' + error.message);
      setSaving(false);
      return;
    }

    // Save violations if any
    if (violations.length > 0 && insertedTrade) {
      const violationRows = violations.map(v => ({
        user_id: user.id,
        trade_entry_id: insertedTrade.id,
        violation_type: v,
        severity,
        violation_notes: violationNotes || null,
        violation_date: tradeDate,
      }));
      const { error: vError } = await supabase.from('violations').insert(violationRows);
      if (vError) toast.error('Trade saved but violations failed: ' + vError.message);
    }

    toast.success(isDraft ? 'Saved as draft!' : 'Trade entry saved!');
    setSaving(false);
    onClose();
  };

  return (
    <div className="glass-card p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">New Trade Entry</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Section 1: Trade Basics */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-primary mb-3 uppercase tracking-wider">Trade Basics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Date</Label>
            <Input type="date" value={tradeDate} onChange={e => setTradeDate(e.target.value)} className="mt-1 font-mono" />
          </div>
          <div>
            <Label>Day</Label>
            <Input value={tradeDay} readOnly className="mt-1 font-mono bg-secondary/30" />
          </div>
          <div>
            <Label>Session</Label>
            <select
              value={session}
              onChange={e => setSession(e.target.value as Session)}
              className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option>Pre-Market</option>
              <option>Regular</option>
              <option>Post-Market</option>
            </select>
          </div>
          <div>
            <Label>Instrument</Label>
            <Input value={instrument} onChange={e => setInstrument(e.target.value)} placeholder="NIFTY 50" className="mt-1" />
          </div>
        </div>
        <div className="mt-4">
          <Label>Trade Type</Label>
          <div className="flex gap-2 mt-1">
            {(['Long', 'Short'] as TradeType[]).map(t => (
              <button
                key={t}
                onClick={() => setTradeType(t)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tradeType === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Sentiment */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-primary mb-3 uppercase tracking-wider">Market Sentiment</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {SENTIMENTS.map(s => (
            <button
              key={s.value}
              onClick={() => setSentiment(s.value)}
              className={`p-3 rounded-lg text-center text-sm transition-all ${sentiment === s.value ? 'bg-primary/20 border border-primary/40 glow-border' : 'bg-secondary hover:bg-accent border border-transparent'}`}
            >
              <div className="text-xl mb-1">{s.emoji}</div>
              <div className="text-xs">{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Execution */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-primary mb-3 uppercase tracking-wider">Trade Execution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><Label>Entry Price</Label><Input type="number" value={entryPrice || ''} onChange={e => setEntryPrice(Number(e.target.value))} className="mt-1 font-mono" /></div>
          <div><Label>Exit Price</Label><Input type="number" value={exitPrice || ''} onChange={e => setExitPrice(Number(e.target.value))} className="mt-1 font-mono" /></div>
          <div><Label>Target Qty</Label><Input type="number" value={targetQty || ''} onChange={e => setTargetQty(Number(e.target.value))} className="mt-1 font-mono" /></div>
          <div><Label>Executed Qty</Label><Input type="number" value={executedQty || ''} onChange={e => setExecutedQty(Number(e.target.value))} className="mt-1 font-mono" /></div>
          <div><Label>Stop Loss</Label><Input type="number" value={stopLoss || ''} onChange={e => setStopLoss(Number(e.target.value))} className="mt-1 font-mono" /></div>
          <div><Label>Target Price</Label><Input type="number" value={targetPrice || ''} onChange={e => setTargetPrice(Number(e.target.value))} className="mt-1 font-mono" /></div>
        </div>
      </div>

      {/* Section 4: Financials */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-primary mb-3 uppercase tracking-wider">Financials</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Gross P&L</Label>
            <div className={`mt-1 h-10 rounded-md bg-secondary/30 border border-input px-3 flex items-center font-mono font-medium ${getPnlColor(grossPnl)}`}>
              {formatCurrency(grossPnl)}
            </div>
          </div>
          <div>
            <Label>Brokerage</Label>
            <Input type="number" value={brokerage || ''} onChange={e => setBrokerage(Number(e.target.value))} className="mt-1 font-mono" />
          </div>
          <div>
            <Label>Net P&L</Label>
            <div className={`mt-1 h-10 rounded-md bg-secondary/30 border border-input px-3 flex items-center font-mono font-bold ${getPnlColor(netPnl)}`}>
              {formatCurrency(netPnl)}
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Violations */}
      <div className="border border-warning/30 rounded-lg p-4 bg-warning/5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-sm text-primary uppercase tracking-wider">Mistakes & Violations</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {VIOLATION_TYPES.map(v => (
            <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={violations.includes(v)}
                onCheckedChange={checked => {
                  if (checked) setViolations([...violations, v]);
                  else setViolations(violations.filter(x => x !== v));
                }}
              />
              {v}
            </label>
          ))}
        </div>
        {violations.length > 0 && (
          <div className="space-y-3">
            <div>
              <Label>Severity</Label>
              <RadioGroup value={severity} onValueChange={v => setSeverity(v as Severity)} className="flex gap-4 mt-1">
                {(['Low', 'Medium', 'High'] as Severity[]).map(s => (
                  <div key={s} className="flex items-center gap-1.5">
                    <RadioGroupItem value={s} id={s} />
                    <Label htmlFor={s} className="text-sm">{s}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>Violation Notes</Label>
              <Textarea value={violationNotes} onChange={e => setViolationNotes(e.target.value)} placeholder="What happened and why?" className="mt-1" rows={2} />
            </div>
          </div>
        )}
      </div>

      {/* Section 6: Notes & Mood */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-primary mb-3 uppercase tracking-wider">Notes</h3>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="General observations, market context, lessons learned..." rows={3} />
        <div className="mt-3">
          <Label className="text-xs text-muted-foreground">Mood</Label>
          <div className="flex gap-2 mt-1">
            {MOODS.map(m => (
              <button
                key={m.value}
                onClick={() => setMood(mood === m.value ? '' : m.value)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${mood === m.value ? 'bg-primary/20 ring-1 ring-primary/40' : 'bg-secondary hover:bg-accent'}`}
                title={m.value}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2 border-t border-border/50">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="secondary" onClick={() => handleSave(true)} disabled={saving}>Save as Draft</Button>
        <Button onClick={() => handleSave(false)} disabled={saving}>{saving ? 'Saving...' : 'Save Entry'}</Button>
      </div>
    </div>
  );
}
