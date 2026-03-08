import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYMBOLS = [
  { symbol: '^BSESN', name: 'SENSEX', exchange: 'BSE', isIndex: true },
  { symbol: '^NSEI', name: 'NIFTY 50', exchange: 'NSE', isIndex: true },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', isIndex: false },
  { symbol: 'TCS.NS', name: 'TCS', isIndex: false },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', isIndex: false },
  { symbol: 'INFY.NS', name: 'Infosys', isIndex: false },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', isIndex: false },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', isIndex: false },
  { symbol: 'ITC.NS', name: 'ITC', isIndex: false },
  { symbol: 'SBIN.NS', name: 'SBI', isIndex: false },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', isIndex: false },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', isIndex: false },
  { symbol: 'LT.NS', name: 'Larsen & Toubro', isIndex: false },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank', isIndex: false },
  { symbol: 'WIPRO.NS', name: 'Wipro', isIndex: false },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises', isIndex: false },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', isIndex: false },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', isIndex: false },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharma', isIndex: false },
  { symbol: 'TITAN.NS', name: 'Titan Company', isIndex: false },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', isIndex: false },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints', isIndex: false },
];

async function fetchQuote(sym: string) {
  // Use v8 chart endpoint (no auth required)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1d&includePrePost=false`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!resp.ok) {
    const text = await resp.text();
    console.error(`Failed for ${sym}: ${resp.status} ${text}`);
    return null;
  }
  const data = await resp.json();
  const result = data?.chart?.result?.[0];
  if (!result) return null;

  const meta = result.meta;
  const price = meta.regularMarketPrice;
  const previousClose = meta.chartPreviousClose ?? meta.previousClose;
  const change = price - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;

  return {
    symbol: sym,
    price,
    change,
    changePercent,
    previousClose,
    dayHigh: meta.regularMarketDayHigh ?? meta.dayHigh ?? price,
    dayLow: meta.regularMarketDayLow ?? meta.dayLow ?? price,
    volume: meta.regularMarketVolume ?? 0,
    marketState: meta.marketState ?? 'CLOSED',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch all in parallel
    const results = await Promise.allSettled(SYMBOLS.map(s => fetchQuote(s.symbol)));

    const indices: any[] = [];
    const stocks: any[] = [];

    results.forEach((r, i) => {
      if (r.status !== 'fulfilled' || !r.value) return;
      const meta = SYMBOLS[i];
      const quote = { ...r.value, name: meta.name, exchange: meta.exchange };
      if (meta.isIndex) indices.push(quote);
      else stocks.push(quote);
    });

    return new Response(JSON.stringify({ indices, stocks, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Stock prices error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
