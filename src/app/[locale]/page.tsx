import { getLocale, getTranslations } from "next-intl/server";
import { getSessionUser } from "@/auth/session";
import { SignInButtons } from "@/components/sign-in-buttons";
import { redirect } from "@/i18n/navigation";

/**
 * Public landing page: sign-in for visitors, a redirect to the sets page for signed-in users,
 * and the no-access message when sign-in was rejected (`?error=`).
 * @param props route props carrying the error query parameter
 */
export default async function HomePage({ searchParams }: PageProps<"/[locale]">) {
  if (await getSessionUser()) {
    redirect({ href: "/sets", locale: await getLocale() });
  }
  const { error } = await searchParams;
  const t = await getTranslations("HomePage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      {error && (
        <p role="alert" className="text-destructive">
          {t("noAccess")}
        </p>
      )}
      <SignInButtons />
    </main>
  );
}
