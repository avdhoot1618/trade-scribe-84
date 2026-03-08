import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume?: number;
  marketCap?: number;
  marketState?: string;
  exchange?: string;
}

interface StockPricesResponse {
  indices: StockQuote[];
  stocks: StockQuote[];
  fetchedAt: string;
}

async function fetchStockPrices(): Promise<StockPricesResponse> {
  const { data, error } = await supabase.functions.invoke('stock-prices');
  if (error) throw error;
  return data as StockPricesResponse;
}

export function useStockPrices(refetchInterval = 30000) {
  return useQuery({
    queryKey: ['stock-prices'],
    queryFn: fetchStockPrices,
    refetchInterval,
    staleTime: 15000,
    retry: 2,
  });
}
