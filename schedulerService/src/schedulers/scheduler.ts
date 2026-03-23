import { agentQueue } from "@/queue/queue"
import { agentState } from "@/state/state"
import { TICK_MS } from "@/config/config"

let isRunning = false;

export async function startScheduler() {
  if (isRunning) return;
  isRunning = true;

  try {
    const now = Date.now();

    for (const agent of agentState.values()) {
      if (agent.status !== "RUNNING") continue;
      if (agent.nextRunAt > now) continue;


      try {
             const existingJob = await agentQueue.getJob(agent.id);
             if (existingJob) continue;
     
             agentQueue.add("run-agent", {
               agentId: agent.id,
               userId: agent.userId,
               config: agent,
             }, {
               jobId: agent.id,
             });
             agent.nextRunAt += agent.market.agentCycles * 1000;
     
           } catch (err) {
             console.error(`Scheduler error for agent ${agent.id}`, err);
           }
         }

  } finally {
    isRunning = false;
    setTimeout(startScheduler, TICK_MS);
  }
}