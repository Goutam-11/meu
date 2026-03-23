import { connectDB } from "../db/db";
import { ObjectId } from "mongodb";

const db = await connectDB();
const notification = db.collection("Notification");

// Sample test notifications matching the schema
const sampleNotifications = [
  {
    userId: "i6doJMzTAqu4QxUlTZdeUqGuY0PaPYZc",
    agentId: "697f7c4052c3a540b52e31a2",
    exchangeId: null,
    type: "ERROR",
    source: "EXCHANGE",
    status: "UNREAD",
    title: "Exchange Authentication Failed",
    message: "Failed to authenticate with Binance API. Please check your credentials.",
    code: "EXCHANGE_AUTH_FAILED",
    metadata: JSON.stringify({
      exchange: "binance",
      error: "Invalid API key",
      timestamp: new Date().toISOString(),
      ccxtError: {
        code: 401,
        message: "Unauthorized"
      }
    }),
    createdAt: new Date(),
    readAt: null,
  },
  {
    userId: "i6doJMzTAqu4QxUlTZdeUqGuY0PaPYZc",
    agentId: "697f7c4052c3a540b52e31a2",
    exchangeId: new ObjectId().toString(),
    type: "WARNING",
    source: "AGENT",
    status: "UNREAD",
    title: "High Risk Position",
    message: "Your BTCUSD position risk is 5.2% of account. Consider reducing exposure.",
    code: "HIGH_RISK_POSITION",
    metadata: JSON.stringify({
      symbol: "BTCUSD",
      riskPercentage: 5.2,
      maxAllowed: 5.0,
      position: {
        size: 0.5,
        entryPrice: 43000,
        currentPrice: 45000,
        unrealizedPnl: 500
      }
    }),
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    readAt: null,
  },
  {
    userId: "i6doJMzTAqu4QxUlTZdeUqGuY0PaPYZc",
    agentId: "697f7c4052c3a540b52e31a2",
    exchangeId: null,
    type: "INFO",
    source: "SYSTEM",
    status: "READ",
    title: "Agent Run Completed",
    message: "Your LLM_TRADING agent completed a cycle with 2 trades executed.",
    code: "AGENT_RUN_COMPLETED",
    metadata: JSON.stringify({
      agentName: "Crypto Alpha Bot",
      cycleNumber: 42,
      tradesExecuted: 2,
      decisions: [
        { symbol: "ETHUSD", decision: "BUY", confidence: 0.85 },
        { symbol: "ADAUSD", decision: "HOLD", confidence: 0.62 }
      ],
      cycleTime: "2.3s"
    }),
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    readAt: new Date(Date.now() - 6900000),
  },
  {
    userId: "i6doJMzTAqu4QxUlTZdeUqGuY0PaPYZc",
    agentId: "697f7c4052c3a540b52e31a2",
    exchangeId: new ObjectId().toString(),
    type: "WARNING",
    source: "SYSTEM",
    status: "UNREAD",
    title: "API Rate Limit Warning",
    message: "You've used 85% of your daily API rate limit on Kraken exchange.",
    code: "API_RATE_LIMIT_WARNING",
    metadata: JSON.stringify({
      exchange: "kraken",
      rateLimitUsed: 8500,
      rateLimitTotal: 10000,
      resetTime: new Date(Date.now() + 3600000).toISOString()
    }),
    createdAt: new Date(Date.now() - 600000), // 10 minutes ago
    readAt: null,
  },
  {
    userId: "i6doJMzTAqu4QxUlTZdeUqGuY0PaPYZc",
    agentId: "697f7c4052c3a540b52e31a2",
    exchangeId: new ObjectId().toString(),
    type: "INFO",
    source: "AGENT",
    status: "UNREAD",
    title: "Daily Profit Summary",
    message: "Your portfolio gained $234.50 today. ROI: 1.2%",
    code: "DAILY_PROFIT_SUMMARY",
    metadata: JSON.stringify({
      date: "2024-01-15",
      totalGain: 234.50,
      roi: 1.2,
      trades: 5,
      winRate: 0.8,
      largestWin: 145.30,
      largestLoss: -32.15
    }),
    createdAt: new Date(Date.now() - 900000), // 15 minutes ago
    readAt: null,
  },
];

// Insert the sample notifications
const result = await notification.insertMany(sampleNotifications);
console.log(`✅ Inserted ${result.insertedCount} sample notifications`);
console.log("Notification IDs:", result.insertedIds);

// Verify insertion by fetching them back
const allNotifs = await notification.find({}).toArray();
console.log(`\n📋 Total notifications in database: ${allNotifs.length}`);
console.log("\nSample notification data:");
console.log(JSON.stringify(allNotifs[0], null, 2));
