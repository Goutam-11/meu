import { getOHLCV } from "@/agentFunctions/cmFunctions";
import { ema } from "@/agentFunctions/mIndicators";
import type { Exchange } from "ccxt";

export async function getIndicators(timeframe: string = "1m", symbol: string = "BTC/USD", slice: number = 30, exchange: Exchange) {
  const limit = Math.max(50, slice + 20)
  const ohlcv = await getOHLCV(timeframe, symbol, Date.now() - 86400 * 1000, limit, exchange);
  const closedOhlcv = ohlcv.slice(0, -1);
  const closes = ohlcv.map(c => {
    if (c[4] == null) throw new Error("Invalid OHLCV data");
    return c[4];
  });
  const emaFast = ema(closes, 9);
  const emaSlow = ema(closes, 15);

  return {
    ohlcv: closedOhlcv.slice(-slice),
    emaFast: emaFast.slice(-slice),
    emaSlow: emaSlow.slice(-slice),
  };
}