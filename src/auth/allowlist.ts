/**
 * Decides whether an identity may use the app: its email must be verified by the provider
 * and appear on the owner's comma-separated allowlist (case and surrounding spaces ignored).
 * @param email email reported by the provider or stored on the user
 * @param emailVerified whether the provider verified that email
 * @param rawList the `ALLOWED_EMAILS` value
 */
export function isAllowed(
  email: string | null | undefined,
  emailVerified: boolean | null | undefined,
  rawList: string | undefined,
): boolean {
  const wanted = email?.trim().toLowerCase();
  if (!wanted || emailVerified !== true) {
    return false;
  }
  return (rawList ?? "").split(",").some((entry) => entry.trim().toLowerCase() === wanted);
}
