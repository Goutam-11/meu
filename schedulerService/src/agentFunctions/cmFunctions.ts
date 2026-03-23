import { Exchange } from "ccxt";
import { macd, rsi } from "./mIndicators";

export async function getOHLCV(timeframe: string, symbol: string, since: number, limit: number = 1000, exchange: Exchange) {
  const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, since, limit);
  return ohlcv;
}

export async function getIntradayIndicators(timeframe: string = "1m", symbol: string = "BTC/USD", slice: number = 30,exchange:Exchange){
  const ohlcv = await getOHLCV(timeframe, symbol, Date.now() - 86400 * 1000, 500,exchange);
  const midPrices = ohlcv.map(c => (c[1]! + c[4]!) / 2);
  const { maCD, signal, histogram, emaFast, emaSlow } = macd(ohlcv, 12, 26, 9, slice);
  const rSI = rsi(ohlcv, 14, 30);
  return {
    ohlcv: ohlcv.slice(-30),
    midPrices: midPrices.slice(-slice),
    maCD,
    signal,
    histogram,
    emaFast,
    emaSlow,
    rSI
  };
}
export async function getSwingIndicators(timeframe: string = "4h", symbol: string = "BTC/USD", slice: number = 30,exchange:Exchange){
  const ohlcv = await getOHLCV(timeframe, symbol, Date.now() - 7 * 86400 * 1000, 1000,exchange);
  const midPrices = ohlcv.map(c => (c[1]! + c[4]!) / 2);
  const { maCD, signal, histogram, emaFast, emaSlow } = macd(ohlcv, 12, 26, 9, slice);
  const rSI = rsi(ohlcv, 14, 30);
  return {
    ohlcv: ohlcv.slice(-30),
    midPrices: midPrices.slice(-slice),
    maCD,
    signal,
    histogram,
    emaFast,
    emaSlow,
    rSI
  };
}
export async function getLongTermIndicators(timeframe: string = "1d", symbol: string = "BTC/USD", slice: number = 30,exchange:Exchange){
  const ohlcv = await getOHLCV(timeframe, symbol, Date.now() - 35 * 86400 * 1000, 1000,exchange);
  const midPrices = ohlcv.map(c => (c[1]! + c[4]!) / 2);
  const { maCD, signal, histogram, emaFast, emaSlow } = macd(ohlcv, 12, 26, 9, slice);
  const rSI = rsi(ohlcv, 14, 30);
  return {
    ohlcv: ohlcv.slice(-30),
    midPrices: midPrices.slice(-slice),
    maCD,
    signal,
    histogram,
    emaFast,
    emaSlow,
    rSI
  };
}