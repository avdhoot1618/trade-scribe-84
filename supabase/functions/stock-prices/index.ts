import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface StockMeta {
  symbol: string;
  gfSymbol: string; // Google Finance symbol format e.g. "RELIANCE:NSE"
  name: string;
  exchange?: string;
  isIndex: boolean;
}

const STOCKS: StockMeta[] = [
  { symbol: '^BSESN', gfSymbol: 'SENSEX:INDEXBOM', name: 'SENSEX', exchange: 'BSE', isIndex: true },
  { symbol: '^NSEI', gfSymbol: 'NIFTY_50:INDEXNSE', name: 'NIFTY 50', exchange: 'NSE', isIndex: true },
  { symbol: 'RELIANCE.NS', gfSymbol: 'RELIANCE:NSE', name: 'Reliance Industries', isIndex: false },
  { symbol: 'TCS.NS', gfSymbol: 'TCS:NSE', name: 'TCS', isIndex: false },
  { symbol: 'HDFCBANK.NS', gfSymbol: 'HDFCBANK:NSE', name: 'HDFC Bank', isIndex: false },
  { symbol: 'INFY.NS', gfSymbol: 'INFY:NSE', name: 'Infosys', isIndex: false },
  { symbol: 'ICICIBANK.NS', gfSymbol: 'ICICIBANK:NSE', name: 'ICICI Bank', isIndex: false },
  { symbol: 'HINDUNILVR.NS', gfSymbol: 'HINDUNILVR:NSE', name: 'Hindustan Unilever', isIndex: false },
  { symbol: 'ITC.NS', gfSymbol: 'ITC:NSE', name: 'ITC', isIndex: false },
  { symbol: 'SBIN.NS', gfSymbol: 'SBIN:NSE', name: 'SBI', isIndex: false },
  { symbol: 'BHARTIARTL.NS', gfSymbol: 'BHARTIARTL:NSE', name: 'Bharti Airtel', isIndex: false },
  { symbol: 'KOTAKBANK.NS', gfSymbol: 'KOTAKBANK:NSE', name: 'Kotak Mahindra Bank', isIndex: false },
  { symbol: 'LT.NS', gfSymbol: 'LT:NSE', name: 'Larsen & Toubro', isIndex: false },
  { symbol: 'AXISBANK.NS', gfSymbol: 'AXISBANK:NSE', name: 'Axis Bank', isIndex: false },
  { symbol: 'WIPRO.NS', gfSymbol: 'WIPRO:NSE', name: 'Wipro', isIndex: false },
  { symbol: 'ADANIENT.NS', gfSymbol: 'ADANIENT:NSE', name: 'Adani Enterprises', isIndex: false },
  { symbol: 'TATAMOTORS.NS', gfSymbol: 'TATAMOTORS:NSE', name: 'Tata Motors', isIndex: false },
  { symbol: 'MARUTI.NS', gfSymbol: 'MARUTI:NSE', name: 'Maruti Suzuki', isIndex: false },
  { symbol: 'SUNPHARMA.NS', gfSymbol: 'SUNPHARMA:NSE', name: 'Sun Pharma', isIndex: false },
  { symbol: 'TITAN.NS', gfSymbol: 'TITAN:NSE', name: 'Titan Company', isIndex: false },
  { symbol: 'BAJFINANCE.NS', gfSymbol: 'BAJFINANCE:NSE', name: 'Bajaj Finance', isIndex: false },
  { symbol: 'ASIANPAINT.NS', gfSymbol: 'ASIANPAINT:NSE', name: 'Asian Paints', isIndex: false },
];

async function fetchGoogleFinanceQuote(meta: StockMeta) {
  try {
    const url = `https://www.google.com/finance/quote/${meta.gfSymbol}`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!resp.ok) {
      console.error(`Google Finance ${meta.gfSymbol}: HTTP ${resp.status}`);
      await resp.text();
      return null;
    }

    const html = await resp.text();

    // Extract current price from data-last-price attribute
    const priceMatch = html.match(/data-last-price="([^"]+)"/);
    const prevCloseMatch = html.match(/data-previous-close="([^"]+)"/);
    
    if (!priceMatch) {
      console.error(`No price found for ${meta.gfSymbol}`);
      return null;
    }

    const price = parseFloat(priceMatch[1]);
    const previousClose = prevCloseMatch ? parseFloat(prevCloseMatch[1]) : price;
    const change = price - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    // Try to extract high/low
    const highMatch = html.match(/data-.*?high.*?"([0-9,.]+)"/i);
    const lowMatch = html.match(/data-.*?low.*?"([0-9,.]+)"/i);

    // Extract volume if available
    const volumeMatch = html.match(/data-.*?volume.*?"([0-9,.]+)"/i);

    // Market state
    const isMarketOpen = html.includes('Market open') || html.includes('data-market-state="open"');

    return {
      symbol: meta.symbol,
      name: meta.name,
      exchange: meta.exchange,
      price,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      previousClose,
      dayHigh: highMatch ? parseFloat(highMatch[1].replace(/,/g, '')) : price,
      dayLow: lowMatch ? parseFloat(lowMatch[1].replace(/,/g, '')) : price,
      volume: volumeMatch ? parseInt(volumeMatch[1].replace(/,/g, '')) : 0,
      marketState: isMarketOpen ? 'REGULAR' : 'CLOSED',
    };
  } catch (err) {
    console.error(`Error fetching ${meta.gfSymbol}:`, err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch all quotes in parallel (batches of 5 to avoid rate limiting)
    const results: any[] = [];
    
    for (let i = 0; i < STOCKS.length; i += 5) {
      const batch = STOCKS.slice(i, i + 5);
      const batchResults = await Promise.allSettled(
        batch.map(s => fetchGoogleFinanceQuote(s))
      );
      for (const r of batchResults) {
        results.push(r.status === 'fulfilled' ? r.value : null);
      }
    }

    const indices = results.filter((r, i) => r && STOCKS[i].isIndex);
    const stocks = results.filter((r, i) => r && !STOCKS[i].isIndex);

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
