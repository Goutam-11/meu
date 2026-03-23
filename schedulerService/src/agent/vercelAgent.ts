import { Exchange } from "ccxt";
import {
  getIntradayIndicators,
  getSwingIndicators,
  getLongTermIndicators,
} from "@/agentFunctions/cmFunctions";
import { TPROMPT } from "@/agent/prompts/testPrompt";
import { ToolLoopAgent } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getCryptoTools } from "@/agent/tools/cryptoTools/cryptoTools";

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

type TestAgentParams = {
  Coin: string[];
  exchange: Exchange;
  llmKey: string;
  model: string;
  name: string
};

export async function tradingAgent(
  { Coin,
    exchange,
    llmKey,
    model,
    name
  }: TestAgentParams
) {
  const coins = Coin
  let analysis = ""
  let trades = ""
  for (const coin of coins) {
    const intraMarketData = await getIntradayIndicators(
      "5m",
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
    .replace("OPEN_POSITIONS", openPositions.toString())
    .replace("TRADES_EXECUTED", trades.toString())
    .replace("ACCOUNT_STATUS", accountStatus.toString())
    .replace("EXCHANGE_NAME", name);
  
  const op = createOpenRouter({
    apiKey: llmKey,
  });
  
  const cryptoTools = getCryptoTools({ exchange });

  const tradingAgent = new ToolLoopAgent({
    model: op.chat(model),
    tools: cryptoTools,
    instructions:
      "You are a trading Agent named meu.",
    maxOutputTokens: 2000,
  });
  
  const result = await tradingAgent.generate({
    prompt: newPrompt + " Check the market status and make decisions based on the data. This is a test environment so dont think about profit and losses , as i want to check the overal system functionality so trade to test."
  })
  
  if ("text" in result.content) {
    return result.text;
  }
  else return result.content;
}
