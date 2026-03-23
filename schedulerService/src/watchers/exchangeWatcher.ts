import { type Collection, type Document } from "mongodb";
import { exchangeState } from "../state/state";

export function startExchangeWatcher(collection: Collection<Document>) {
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
        exchangeState.delete(id);
        return;
      }
  
      // For insert, update, or replace, fullDocument exists
      const doc = change.fullDocument; 
      
      if (!doc) {
        console.warn("No full document in event:", change);
        return;
      }
  
      exchangeState.set(id, {
        id,
        userId: doc.userId,
        lastSyncAt: doc.lastSyncAt,
        name: doc.name,
        apiKey: doc.apiKey,
        secret: doc.secret,
      });
    }
  }); 
  changeStream.on("error", (err: any) => {
    console.error("change stream error:",err)
  })
  console.log("Change stream exchange watcher started.")
}