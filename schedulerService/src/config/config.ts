import ccxt from "ccxt";
export const TICK_MS = 60 * 1000;
// ccxt exchange map

export const exchangeMap = {
  BINANCE: ccxt.binance,
  BYBIT: ccxt.bybit,
  KRAKEN: ccxt.kraken,
  KUCOIN: ccxt.kucoin,
  DELTA: ccxt.delta,
};

export type ExchangeName = keyof typeof exchangeMap;

export function formatSecondsToCycle(seconds: number): string {
  if (seconds % 86400 === 0) {
    return `${seconds / 86400}d`;
  }
  if (seconds % 3600 === 0) {
    return `${seconds / 3600}h`;
  }
  if (seconds % 60 === 0) {
    return `${seconds / 60}m`;
  }
  return `${seconds}s`;
}