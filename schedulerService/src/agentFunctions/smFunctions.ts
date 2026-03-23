import { macd, rsi } from "./mIndicators";


export async function fetchYahooOHLCV(
  symbol: string,
  interval: string,   // '1m', '5m', '15m', '1h', '1d', etc.
  range: string       // e.g. '7d', '1mo', '3mo'
): Promise<number[][]> {
  // Construct the Yahoo Finance chart URL
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible)", // avoid simple bot blocks
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo request failed: ${response.status}`);
  }

  const json = await response.json();

  // If Yahoo returns no valid result, bail
  const result = json?.chart?.result?.[0];
  if (!result) {
    throw new Error("No chart data returned");
  }

  const timestamps: number[] = result.timestamp;
  const quote = result.indicators.quote?.[0];

  if (!timestamps || !quote) {
    throw new Error("Incomplete OHLCV data");
  }

  const candles: number[][] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const o = quote.open?.[i];
    const h = quote.high?.[i];
    const l = quote.low?.[i];
    const c = quote.close?.[i];
    const v = quote.volume?.[i];

    // Skip missing data points
    if (o == null || h == null || l == null || c == null || v == null) continue;

    candles.push([(timestamps[i] * 1000),o,h,l,c,v])
  }

  return candles;
}

export async function getStocksIntradayIndicators(timeframe: string = "1m", symbol: string = "BTC/USD", slice: number = 30){
  const ohlcv = await fetchYahooOHLCV( symbol, timeframe, "4h");
  const midPrices = ohlcv.map(c => (c[1]! + c[4]!) / 2);
  const { closePrices, maCD, signal, histogram, emaFast, emaSlow } = macd(ohlcv, 12, 26, 9, slice);
  const rSI = rsi(ohlcv, 14, 30);
  return {
    closePrices,
    midPrices: midPrices.slice(-slice),
    maCD,
    signal,
    histogram,
    emaFast,
    emaSlow,
    rSI
  };
}
export async function getStocksSwingIndicators(timeframe: string = "4h", symbol: string = "BTC/USD", slice: number = 30){
  const ohlcv = await fetchYahooOHLCV( symbol, timeframe, "7d");;
  const midPrices = ohlcv.map(c => (c[1]! + c[4]!) / 2);
  const { closePrices,maCD, signal, histogram, emaFast, emaSlow } = macd(ohlcv, 12, 26, 9, slice);
  const rSI = rsi(ohlcv, 14, 30);
  return {
    closePrices,
    midPrices: midPrices.slice(-slice),
    maCD,
    signal,
    histogram,
    emaFast,
    emaSlow,
    rSI
  };
}
export async function getStocksLongTermIndicators(timeframe: string = "1d", symbol: string = "BTC/USD", slice: number = 30){
  const ohlcv = await fetchYahooOHLCV( symbol, timeframe, "1mo");;
  const midPrices = ohlcv.map(c => (c[1]! + c[4]!) / 2);
  const { closePrices,maCD, signal, histogram, emaFast, emaSlow } = macd(ohlcv, 12, 26, 9, slice);
  const rSI = rsi(ohlcv, 14, 30);
  return {
    closePrices,
    midPrices: midPrices.slice(-slice),
    maCD,
    signal,
    histogram,
    emaFast,
    emaSlow,
    rSI
  };
}


