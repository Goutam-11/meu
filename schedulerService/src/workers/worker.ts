import { Worker } from "bullmq";
import { redis as connection } from "@/queue/queue";
import { connectDB } from "@/db/db";
import { exchangeMap, type ExchangeName } from "@/config/config";
import { tradingAgent } from "@/agent/vercelAgent";
import { isJSONArray } from "@ai-sdk/provider";

export async function startWorkers() {
  const db = await connectDB();

  // const trades = db.collection("Trade");
  // const positions = db.collection("Position");
  const runs = db.collection("AgentRuns");
  const notifications = db.collection("Notification");

  const agentWorker = new Worker(
    "agent-execution",
    async (job) => {
      try {
        console.log("Execution started for agent", job.data.agentId);
  
        const { agentId, config } = job.data;
  
        const Exchange =
          exchangeMap[config.exchange.name.toUpperCase() as ExchangeName];
  
        if (!Exchange) {
          throw new Error(`Exchange not found: ${config.exchange.name}`);
        }
  
        console.log("Exchange class resolved");
  
        const exchange = new Exchange({
          apiKey: config.exchange.apiKey,
          secret: config.exchange.secret,
          ...(config.exchange.urls?.public &&
            config.exchange.urls?.private && {
              urls: {
                api: {
                  public: config.exchange.urls.public,
                  private: config.exchange.urls.private,
                },
              },
            }),
        });
  
        console.log("Exchange instance created");
  
        console.log("Running trading agent");
  
        const response = await tradingAgent({
          Coin: config.market.symbols,
          exchange,
          llmKey: config.credential.apiKey,
          model: config.llmModel,
          name: config.exchange.name,
        });
  
        console.log("Response received", response);
        let finalResponse: string;
        
        if (typeof response === "string") {
          finalResponse = response;
        
        } else if (Array.isArray(response)) {
          finalResponse = response[0]?.type === "text" ? response[0]?.text ?? "" : JSON.stringify(response[0]);
        
        } else {
          finalResponse = JSON.stringify(response); // fallback (never lose data)
        }

  
        await runs.insertOne({ agentId, llmrResponse: finalResponse, createdAt: new Date() });
  
        console.log("Response saved to database");
  
      } catch (err) {
        console.error("❌ Worker failed:", err);
        throw err; // IMPORTANT → lets BullMQ mark job as failed
      }
    },
    { connection, concurrency: 10, lockDuration: 60_000 }
  );

  agentWorker.on("failed", async (job, err) => {
    await notifications.insertOne({
      type: "ERROR",
      source: "AGENT",
      status: "UNREAD",
      title: "Agent Execution Failed",
      code: "AGENT_EXECUTION_FAILED",
      metadata: err.stack,
      userId: job?.data.userId,
      agentId: job?.data.agentId,
      exchangeId: null,
      message: err.message,
      createdAt: new Date(),
      readAt: null
    });
  });

  agentWorker.on("error", (err) => {
    console.error("Agent worker error", err);
  });

  const exchangeWorker = new Worker(
    "exchange-execution",
    async (job) => {
      const { exchangeId, config } = job.data;
      const Exchange = exchangeMap[config.name.toUpperCase() as ExchangeName];
      const exchange = new Exchange({
        apiKey: config.exchange.apiKey,
        secret: config.exchange.secret,
      })
    },

    { connection, concurrency: 10, lockDuration: 60_000 },
  );

  exchangeWorker.on("failed", async (job, err) => {
    await notifications.insertOne({
      type: "ERROR",
      source: "EXCHANGE",
      status: "UNREAD",
      title: "Exchange Sync Failed",
      code: "EXCHANGE_SYNC_FAILED",
      metadata: err.stack,
      userId: job?.data.config.userId,
      agentId: null,
      exchangeId: job?.data.exchangeId,
      message: err.message,
      createdAt: new Date(),
      readAt: null
    });
  });

  exchangeWorker.on("error", (err) => {
    console.error("Exchange worker error", err);
  });

  console.log("Workers started");
  // graceful shutdown
  const shutdown = async () => {
    console.log("Shutting down workers...");
    await agentWorker.close();
    await exchangeWorker.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startWorkers().catch((err) => {
  console.error("Worker startup failed", err);
  process.exit(1);
});
