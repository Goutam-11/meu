import { type Collection, type Document } from "mongodb";
import { agentState } from "../state/state";

export function startWatcher(collection: Collection<Document>) {
  const pipeline = [{
    $match: {
      operationType: {
        $in: ["insert", "update", "remove", "delete"]
      }
    }
  }];
  const changeStream = collection.watch(pipeline, {
    fullDocument: "updateLookup"
  })

  changeStream.on("change", (change: Document) => {
    // Narrow the scope to operations that have a documentKey
    if (
      change.operationType === "insert" ||
      change.operationType === "update" ||
      change.operationType === "replace" ||
      change.operationType === "delete"
    ) {
      const id = change.documentKey._id.toString();
  
      // Now handle the delete specifically
      if (change.operationType === "delete") {
        agentState.delete(id);
        return;
      }
  
      // For insert, update, or replace, fullDocument exists
      const doc = change.fullDocument; 
      
      if (!doc) {
        console.warn("No full document in event:", change);
        return;
      }
  
      agentState.set(id, {
        id,
        userId: doc.userId,
        nextRunAt: doc.nextRunAt,
        type: doc.type,
        llmModel: doc.llmModel,
        strategy: doc.strategy,
        exchange: doc.exchange,
        credential: doc.credential,
        market: doc.market,
        risk: doc.risk,
        capital: doc.capital,
        status: doc.status
      });
    }
  }); 
  changeStream.on("error", (err: any) => {
    console.error("change stream error:",err)
  })
  console.log("Change stream agent watcher started.")
}