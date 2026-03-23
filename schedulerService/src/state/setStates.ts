import type { Collection, Document } from "mongodb";
import { agentState, exchangeState } from "./state";

export async function bootstrapAgents(agentsCol: Document[]) {

  for (const a of agentsCol) {
    agentState.set(a._id.toString(), {
      id: a._id.toString(),
      nextRunAt: Date.now() + a.market.agentCycles * 1000, 
      status: a.status,
      userId: a.userId, //TODO : change this as per actual state of the agent
      type: a.type,
      llmModel: a.llmModel,
      strategy: a.strategy,
      credential: a.credential,
      exchange: a.exchange,
      market: a.market,
      risk: a.risk,
      capital: a.capital,
    });
  }
}

export async function bootstrapExchanges(exchanges:Document[]) {

  for (const acc of exchanges) {
    exchangeState.set(acc._id.toString(), {
      id: acc._id.toString(),
      userId: acc.userId,
      name: acc.name,
      apiKey: acc.apiKey,
      secret: acc.apiSecret,
      lastSyncAt: acc.lastSyncAt ?? 0
    });
  }
}
