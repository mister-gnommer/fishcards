import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Returns the current request's Worker bindings and secrets. The single place app code touches
 * the Cloudflare runtime; deliberately a plain helper, not an interface or adapter, which would be
 * overkill for this app for now.
 */
export const getEnv = (): CloudflareEnv => getCloudflareContext().env;
