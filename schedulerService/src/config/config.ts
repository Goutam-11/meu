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