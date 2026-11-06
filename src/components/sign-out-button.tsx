"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

/** Ends the session on the server, then returns to the landing page in the current language. */
export function SignOutButton() {
  const t = useTranslations("Header");
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  /**
   * Signs out, then refreshes so server components drop the signed-in header. On failure it stays
   * put, because the landing page would bounce a still-signed-in user straight back.
   */
  const signOut = async () => {
    setFailed(false);
    try {
      // signOut() reports HTTP errors in `error`; network failures throw.
      const { error } = await authClient.signOut();
      if (error) {
        setFailed(true);
        return;
      }
    } catch {
      setFailed(true);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {failed && (
        <span role="alert" className="text-sm text-destructive">
          {t("signOutFailed")}
        </span>
      )}
      <Button variant="outline" size="sm" onClick={signOut}>
        {t("signOut")}
      </Button>
    </>
  );
}
