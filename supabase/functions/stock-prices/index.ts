import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Yahoo Finance symbols for Indian indices and stocks
const SYMBOLS = {
  indices: [
    { symbol: '^BSESN', name: 'SENSEX', exchange: 'BSE' },
    { symbol: '^NSEI', name: 'NIFTY 50', exchange: 'NSE' },
  ],
  stocks: [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'TCS' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
    { symbol: 'ITC.NS', name: 'ITC' },
    { symbol: 'SBIN.NS', name: 'SBI' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro' },
    { symbol: 'AXISBANK.NS', name: 'Axis Bank' },
    { symbol: 'WIPRO.NS', name: 'Wipro' },
    { symbol: 'ADANIENT.NS', name: 'Adani Enterprises' },
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki' },
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharma' },
    { symbol: 'TITAN.NS', name: 'Titan Company' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
    { symbol: 'ASIANPAINT.NS', name: 'Asian Paints' },
  ],
};

async function fetchYahooQuote(symbols: string[]) {
  const joined = symbols.join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(joined)}`;
  
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Yahoo Finance API error [${resp.status}]: ${text}`);
  }

  const data = await resp.json();
  return data.quoteResponse?.result || [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const allSymbols = [
      ...SYMBOLS.indices.map(i => i.symbol),
      ...SYMBOLS.stocks.map(s => s.symbol),
    ];

    const quotes = await fetchYahooQuote(allSymbols);

    const indexSymbols = new Set(SYMBOLS.indices.map(i => i.symbol));
    
    const indices = quotes
      .filter((q: any) => indexSymbols.has(q.symbol))
      .map((q: any) => {
        const meta = SYMBOLS.indices.find(i => i.symbol === q.symbol);
        return {
          symbol: q.symbol,
          name: meta?.name || q.shortName,
          exchange: meta?.exchange,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent,
          previousClose: q.regularMarketPreviousClose,
          dayHigh: q.regularMarketDayHigh,
          dayLow: q.regularMarketDayLow,
          marketState: q.marketState,
        };
      });

    const stocks = quotes
      .filter((q: any) => !indexSymbols.has(q.symbol))
      .map((q: any) => {
        const meta = SYMBOLS.stocks.find(s => s.symbol === q.symbol);
        return {
          symbol: q.symbol,
          name: meta?.name || q.shortName,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent,
          previousClose: q.regularMarketPreviousClose,
          dayHigh: q.regularMarketDayHigh,
          dayLow: q.regularMarketDayLow,
          volume: q.regularMarketVolume,
          marketCap: q.marketCap,
          marketState: q.marketState,
        };
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
