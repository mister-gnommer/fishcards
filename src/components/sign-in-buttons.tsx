"use client";

import { useLocale, useTranslations } from "next-intl";
import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";

/** Google and GitHub sign-in; both return to the language the user started in. */
export function SignInButtons() {
  const t = useTranslations("SignIn");
  const locale = useLocale();

  /**
   * Starts the provider's OAuth flow. Better Auth adds `?error=` to the error URL on rejection.
   * @param provider which OAuth provider to use
   */
  const signIn = (provider: "google" | "github") =>
    authClient.signIn.social({
      provider,
      callbackURL: `/${locale}/sets`,
      errorCallbackURL: `/${locale}`,
    });

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button onClick={() => signIn("google")}>{t("google")}</Button>
      <Button onClick={() => signIn("github")}>{t("github")}</Button>
    </div>
  );
}
