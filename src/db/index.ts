import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// HTTP driver: each query is one fetch, so no connection limits on serverless.
export const db = drizzle(neon(process.env.DATABASE_URL!));
