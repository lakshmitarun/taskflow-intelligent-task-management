import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    return Response.json({
      status: "✅ Connected",
      database: db.databaseName,
      collections: collections.map((c) => c.name),
      uri_set: !!process.env.MONGODB_URI,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      {
        status: "❌ Connection failed",
        error: message,
        uri_set: !!process.env.MONGODB_URI,
        uri_preview: process.env.MONGODB_URI
          ? process.env.MONGODB_URI.replace(/:([^:@]+)@/, ":****@")
          : "NOT SET",
      },
      { status: 500 }
    );
  }
}
