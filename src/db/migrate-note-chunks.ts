import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function main() {
  console.log("Applying note_chunks migration...");
  
  await client`
    CREATE TABLE IF NOT EXISTS "note_chunks" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "note_id" uuid NOT NULL REFERENCES "notes"("id") ON DELETE CASCADE,
      "content" text NOT NULL,
      "embedding" vector(768) NOT NULL,
      "chunk_index" integer NOT NULL
    );
  `;
  
  console.log("Migration applied successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
