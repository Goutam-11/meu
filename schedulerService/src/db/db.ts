import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI!;
if (!MONGO_URI) throw new Error("MONGO_URI missing");

const client = new MongoClient(MONGO_URI);

export async function connectDB() {
  await client.connect();
  return client.db("meu");
}
