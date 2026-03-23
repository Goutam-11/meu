export type AgentRuntime = {
  id: string;
  userId: string;
  nextRunAt: number;
  type: "CRYPTO" | "STOCK";
  llmModel?: string;
  strategy: "ALGO_TRADING" | "LLM_TRADING" | "HYBRID";
  credential: {
    type: "OPENROUTER" | "OPENAI" | "ANTHROPIC";
    apiKey: string
  }
  exchange: ExchangeRuntime;
  market: {
    symbols: string[];
    agentCycles: number;
  };
  risk: {
    maxRiskPerTradePct: number;
    maxDailyLossPct: number;
    maxOpenPositions: number;
  }
  capital: {
    allocated: number;
    currency: string;
  }
  status: "PAUSED" | "RUNNING",
}

export type ExchangeRuntime = {
  id: string;
  userId: string;
  name: string;
  apiKey: string;
  secret: string;
  lastSyncAt?: number;
}

export const agentState = new Map<string, AgentRuntime>();
export const exchangeState = new Map<string, ExchangeRuntime>();