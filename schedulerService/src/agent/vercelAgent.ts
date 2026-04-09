import { Exchange } from "ccxt";
import {
  getIntradayIndicators,
  getSwingIndicators,
  getLongTermIndicators,
} from "@/agentFunctions/cmFunctions";
import { TPROMPT } from "@/agent/prompts/testPrompt";
import { ToolLoopAgent } from "ai";
// import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getCryptoTools } from "@/agent/tools/cryptoTools/cryptoTools";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// const exchange = new ccxt.delta({
//   apiKey: process.env.DELTA_API_KEY,
//   secret: process.env.DELTA_API_SECRET,
//   urls: {
//     api: {
//       public: 'https://cdn-ind.testnet.deltaex.org',
//       private: 'https://cdn-ind.testnet.deltaex.org'
//     }
//   }
// });

// exchange.setSandboxMode(true);

type TradingAgentParams = {
  Coin: string[];
  exchange: Exchange;
  llmKey: string;
  model: string;
  name: string;
  cycles: string;
};

export async function tradingAgent(
  { Coin,
    exchange,
    llmKey,
    model,
    name,
    cycles
  }: TradingAgentParams
) {
  const coins = Coin
  let analysis = ""
  let trades = ""
  for (const coin of coins) {
    const intraMarketData = await getIntradayIndicators(
      cycles,
      coin,
      30,
      exchange,
    );
    const swingMarketData = await getSwingIndicators(
      "4h",
      coin,
      30,
      exchange,
    );
    const longMarketData = await getLongTermIndicators(
      "1d",
      coin,
      30,
      exchange,
    );

    analysis += `
    Analysis for ${coin}
    Intraday Market Analysis:
    - Intraday ohlcv: ${intraMarketData.ohlcv}
    - Intraday midPrices: ${intraMarketData.midPrices}
    - Intraday macd: ${intraMarketData.maCD}
    - Intraday signal: ${intraMarketData.signal}
    - Intraday histogram: ${intraMarketData.histogram}
    - Intraday ema12: ${intraMarketData.emaFast}
    - Intraday ema26: ${intraMarketData.emaSlow}
    - Intraday rsi: ${intraMarketData.rSI}

    Swing Market Analysis:
    - Swing ohlcv: ${swingMarketData.ohlcv}
    - Swing midPrices: ${swingMarketData.midPrices}
    - Swing macd: ${swingMarketData.maCD}
    - Swing signal: ${swingMarketData.signal}
    - Swing histogram: ${swingMarketData.histogram}
    - Swing ema12: ${swingMarketData.emaFast}
    - Swing ema26: ${swingMarketData.emaSlow}
    - Swing rsi: ${swingMarketData.rSI}

    Long-term Market Analysis:
    - Long-term ohlcv: ${longMarketData.ohlcv}
    - Long-term midPrices: ${longMarketData.midPrices}
    - Long-term macd: ${longMarketData.maCD}
    - Long-term signal: ${longMarketData.signal}
    - Long-term histogram: ${longMarketData.histogram}
    - Long-term ema12: ${longMarketData.emaFast}
    - Long-term ema26: ${longMarketData.emaSlow}
    - Long-term rsi: ${longMarketData.rSI}
  `;

    trades += (await exchange.fetchTrades(coin)).toString();

  }
  const openPositions = await exchange.fetchPositions(coins);
  const accountStatus = exchange.account();
  
  const newPrompt = TPROMPT.replace("COINS", coins.toString())
    .replace("MARKET_ANALYSIS", analysis)
    .replace("OPEN_POSITIONS", openPositions.length.toString())
    .replace("TRADES_EXECUTED", trades.length.toString())
    .replace("ACCOUNT_STATUS", accountStatus.toString())
    .replace("EXCHANGE_NAME", name);
  
  // const op = createOpenRouter({
  //   apiKey: llmKey,
  // });
  const nim = createOpenAICompatible({
    name: 'nim',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    headers: {
      Authorization: `Bearer ${llmKey}`,
    },
  });
  const cryptoTools = getCryptoTools({ exchange });

  const tradingAgent = new ToolLoopAgent({
    model: nim.chatModel(model),
    tools: cryptoTools,
    instructions:
      "You are a trading Agent named meu.",
    maxOutputTokens: 3000,
  });
  
  const result = await tradingAgent.generate({
    prompt: newPrompt + "You are autonomously running in a system without human intervention. Check the market status and make decisions and trades based on the data. "
  })
  
  if ("text" in result.content) {
    return result.text;
  }
  else return result.content;
}
