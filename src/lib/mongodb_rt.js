let _clientPromise = null;

export async function connectToDatabase() {
  const { MongoClient } = await import("mongodb"); 
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "FindYourProgram";
  if (!_clientPromise) _clientPromise = new MongoClient(uri, {}).connect();
  const client = await _clientPromise;
  return { client, db: client.db(dbName) };
}
