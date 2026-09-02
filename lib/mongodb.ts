import { MongoClient, Db } from "mongodb";

// Use a global variable in dev to preserve the connection across HMR reloads.
declare global {
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient | null = null;

function getClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env.local file."
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri);
    }
    return global._mongoClient;
  }

  if (!client) {
    client = new MongoClient(uri);
  }
  return client;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB ?? "taskflow";
  const c = getClient();
  await c.connect();
  return c.db(dbName);
}

export async function getTasksCollection() {
  const db = await getDb();
  return db.collection("tasks");
}

export async function getEmployeesCollection() {
  const db = await getDb();
  return db.collection("employees");
}
