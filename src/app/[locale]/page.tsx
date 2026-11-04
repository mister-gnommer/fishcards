import { useTranslations } from "next-intl";

/** Localized landing page with the app name and a one-line description. */
export default function HomePage() {
  const t = useTranslations("HomePage");
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
    </main>
  );
}
