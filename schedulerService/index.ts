import { connectDB } from "@/db/db";
import { startWatcher } from "@/watchers/watcher";
import { startScheduler } from "@/schedulers/scheduler";
import { startExchangeWatcher } from "@/watchers/exchangeWatcher";
import { startExchangeScheduler } from "@/schedulers/exchangeScheduler";
import { bootstrapAgents, bootstrapExchanges } from "@/state/setStates";

async function main() {
  const db = await connectDB();
  const agentCollection = db.collection("Agent");
  const agents = await agentCollection
    .find({ status: "RUNNING" })
    .project({
      _id: 1,
      userId: 1,
      status: 1,
      type: 1,
      strategy: 1,
      market: 1,
      risk: 1,
      capital: 1,
      temperature: 1,
      llmModel: 1,
      credentialId: 1,
      exchangeId: 1,
    })
    .toArray();
  console.log(agents)
  // const exchangeCollection = db.collection("Exchange");
  // const exchanges = await exchangeCollection.find().toArray();

  await bootstrapAgents(agents);
  // await bootstrapExchanges(exchanges);
  startWatcher(agentCollection);
  // startExchangeWatcher(exchangeCollection);
  startScheduler();
  // startExchangeScheduler();
}

main().catch(console.error);
