import { exchangeQueue } from "@/queue/queue";
import { exchangeState } from "@/state/state";
import { TICK_MS } from "@/config/config";

export function startExchangeScheduler() {
  setInterval(async () => {
    const now = Date.now();
    
    for (const exchange of exchangeState.values()) {
      // if (exchange?.lastSyncAt > now - TICK_MS) continue;
      exchange.lastSyncAt = now;
      
      // add exchange to queue
      await exchangeQueue.add(
        "run-exchange",
        {
          exchangeId: exchange.id,
          config: exchange
        }, {
        jobId: `${exchange.id}_${now}`
      }
      );
      
    }
  }, TICK_MS);
  console.log("BullMq exchange scheduler started");
}
