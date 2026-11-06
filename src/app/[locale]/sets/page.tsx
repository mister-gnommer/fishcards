import { getLocale, getTranslations } from "next-intl/server";
import { getSessionUser } from "@/auth/session";
import { redirect } from "@/i18n/navigation";

/** The signed-in user's sets. A placeholder until the sets-and-cards change. */
export default async function SetsPage() {
  if (!(await getSessionUser())) {
    redirect({ href: "/", locale: await getLocale() });
  }
  const t = await getTranslations("SetsPage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("empty")}</p>
    </main>
  );
}
