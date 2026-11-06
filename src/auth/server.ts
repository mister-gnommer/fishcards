import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { cache } from "react";
import { getDb } from "@/db";
import { getEnv } from "@/env";
import { authOptions } from "./options";

/**
 * Returns the Better Auth instance for the current request. Secrets and the D1 binding only
 * exist inside a request on Workers, so it can't be created at module load.
 */
export const getAuth = cache(() =>
  betterAuth({
    ...authOptions(getEnv(), getDb()),
    plugins: [nextCookies()],
  }),
);
