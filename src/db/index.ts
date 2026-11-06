import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import { getEnv } from "@/env";
import * as schema from "./schema";

/**
 * Returns a Drizzle client over the request's D1 binding, created once per request.
 * Bindings belong to the request context, so a module-level client must not be used.
 */
export const getDb = cache(() => drizzle(getEnv().DB, { schema }));
