-- Create trade_entries table
CREATE TABLE public.trade_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  trade_day VARCHAR(10),
  session VARCHAR(20),
  instrument VARCHAR(100) NOT NULL,
  trade_type VARCHAR(10),
  sentiment VARCHAR(20),
  entry_price DECIMAL(12,2),
  exit_price DECIMAL(12,2),
  target_quantity INTEGER,
  executed_quantity INTEGER,
  stop_loss DECIMAL(12,2),
  target_price DECIMAL(12,2),
  gross_pnl DECIMAL(12,2),
  brokerage DECIMAL(12,2) DEFAULT 0,
  net_pnl DECIMAL(12,2),
  mood VARCHAR(30),
  notes TEXT,
  is_draft BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trade_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades" ON public.trade_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trade_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON public.trade_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON public.trade_entries FOR DELETE USING (auth.uid() = user_id);

-- Create violations table
CREATE TABLE public.violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_entry_id UUID REFERENCES public.trade_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  violation_type VARCHAR(100) NOT NULL,
  severity VARCHAR(10),
  violation_notes TEXT,
  violation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own violations" ON public.violations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own violations" ON public.violations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own violations" ON public.violations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own violations" ON public.violations FOR DELETE USING (auth.uid() = user_id);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_brokerage DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(5) DEFAULT 'INR',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_trade_entries_updated_at
  BEFORE UPDATE ON public.trade_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();