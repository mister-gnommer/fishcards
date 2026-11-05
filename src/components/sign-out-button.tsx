"use client";

import { useTranslations } from "next-intl";
import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

/** Ends the session on the server, then returns to the landing page in the current language. */
export function SignOutButton() {
  const t = useTranslations("Header");
  const router = useRouter();

  /** Signs out, then refreshes so server components drop the signed-in header. */
  const signOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={signOut}>
      {t("signOut")}
    </Button>
  );
}
