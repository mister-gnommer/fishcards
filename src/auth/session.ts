import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { cache } from "react";
import { isAllowed } from "./allowlist";
import { getAuth } from "./server";

/**
 * Returns the signed-in user, or null when there is no valid session or the user's email
 * has since been removed from the allowlist (re-checked on every request). Cached per render,
 * so the header and the page share one session lookup.
 */
export const getSessionUser = cache(async () => {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }
  const { email, emailVerified } = session.user;
  return isAllowed(email, emailVerified, getCloudflareContext().env.ALLOWED_EMAILS)
    ? session.user
    : null;
});
