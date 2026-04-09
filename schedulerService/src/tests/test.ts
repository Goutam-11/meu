import ccxt, { Exchange } from "ccxt";
import {
  getIntradayIndicators,
  getSwingIndicators,
  getLongTermIndicators,
} from "../agentFunctions/cmFunctions";
import { TPROMPT } from "../agent/prompts/testPrompt";
import { ToolLoopAgent } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getCryptoTools } from "../agent/tools/cryptoTools/cryptoTools";
import { connectDB } from "../db/db";
import { ObjectId } from "mongodb";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const exchange = new ccxt.delta({
  apiKey: process.env.DELTA_API_KEY,
  secret: process.env.DELTA_API_SECRET,
  urls: {
    api: {
      public: 'https://api.india.delta.exchange',
      private: 'https://api.india.delta.exchange'
    }
  }
});

// // exchange.setSandboxMode(true);

type TestAgentParams = {
  Coin: string[];
  exchange: Exchange;
};

async function testAgent(
  { Coin,
    exchange
  }: TestAgentParams
) {
  const coins = Coin
  let analysis = ""
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


  }
  const trades = await exchange.fetchMyTrades();
  const openPositions = await exchange.fetchPositions(coins);
  const accountStatus = await exchange.fetchBalance();
  
  const newPrompt = TPROMPT.replace("COINS", coins.toString())
    .replace("MARKET_ANALYSIS", analysis)
    .replace("OPEN_POSITIONS", openPositions.toString())
    .replace("TRADES_EXECUTED", trades.toString())
    .replace("ACCOUNT_STATUS", JSON.stringify(accountStatus,null,2));
  
  const paidKey = process.env.NIM_API_KEY;
  const nim = createOpenAICompatible({
    name: 'nim',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    headers: {
      Authorization: `Bearer ${paidKey}`,
    },
  });
  
  const cryptoTools = getCryptoTools({ exchange });

  const tradingAgent = new ToolLoopAgent({
    model: nim.chatModel("deepseek-ai/deepseek-v3.1"),
    tools: cryptoTools,
    instructions:
      "You are a trading Agent named meu.",
    maxOutputTokens: 3000,
  });
  
  const result = await tradingAgent.generate({
    prompt: newPrompt + " Check the market status and make decisions based on the data.You can adjust leverage using tools provided."
  })
  return {
    finishReason: result.finishReason,
    content: result.content,
    output: result.text,
    steps: result.steps,
  };
}

// setInterval(async () => {
  const response = await testAgent({ Coin: ["BTCUSD", "ETHUSD", "SOLUSD", "DOGEUSD"],exchange: exchange});
  console.log("AI Response :",response)
// }, 5 * 60 * 1000);
// 

// const positions = await exchange.fetchPositions();
// console.log(positions);

// const db = await connectDB();
// const notifications = db.collection("Notification");
// await notifications.insertOne({
//   type: "INFO",
//   source: "AGENT",
//   title: "test",
//   code: "TEST",
//   metadata: "testing the system",
//   userId: "i6doJMzTAqu4QxUlTZdeUqGuY0PaPYZc",
//   agentId: new ObjectId('695f21d4e336f52fe6cd3375'),
//   message: "testing the system"
// });

// console.log("notification updated")
