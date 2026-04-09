import { getOHLCV } from "@/agentFunctions/cmFunctions";
import type { AgentRuntime } from "@/state/state";
import { sleep } from "bun";
import type { Exchange } from "ccxt";

const marketRequests = new Set<string>();

export function addMarketRequest(agents: AgentRuntime[]) {
  for (const agent of agents) {
    for (const symbol of agent.market.symbols) {
      const key = `${symbol}_${agent.market.agentCycles}`;
      marketRequests.add(key);
    }
  }
}


const marketDataMap = new Map();
export async function populateMarketData(exchange: Exchange) {
  await Promise.all(
    Array.from(marketRequests).map(async (key) => {
      const [symbol, timeframe] = key.split("_");
  
      const data = await getOHLCV(timeframe ?? "5m", symbol ?? "BTCUSD", Date.now() - 86400 * 1000, 50, exchange);
      marketDataMap.set(key, data);
      await sleep(50); //avoid burst
    })
  );
}