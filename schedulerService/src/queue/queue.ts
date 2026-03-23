import { Queue } from "bullmq";
import IORedis from "ioredis";

export const redis = new IORedis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null
});

export const agentQueue = new Queue("agent-execution", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000
    }
  }
})

export const exchangeQueue = new Queue("exchange-execution", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000
    }
  }
})
