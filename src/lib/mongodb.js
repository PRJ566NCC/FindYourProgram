import { MongoClient } from "mongodb";

let client;

function getClientPromise() {
  if (!global._mongoClientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set in environment variables");
    client = new MongoClient(uri, {});
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

const clientPromise = {
  then(onFulfilled, onRejected) {
    return getClientPromise().then(onFulfilled, onRejected);
  }
};

export default clientPromise;

export async function connectToDatabase() {
  const client = await getClientPromise();
  const db = client.db(process.env.MONGODB_DB || "FindYourProgram");
  return { client, db, users: db.collection("users") };
}
