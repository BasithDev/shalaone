import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";

const connectionString = process.env.DATABASE_URL!;

declare global {
  // eslint-disable-next-line no-var
  var _pgClient: ReturnType<typeof postgres> | undefined;
}

const client = globalThis._pgClient ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV === "development") {
  globalThis._pgClient = client;
}

export const db = drizzle(client, { schema });
