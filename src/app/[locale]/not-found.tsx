import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Localized 404 page, shown when a page under `[locale]` calls `notFound()`. */
export default function NotFoundPage() {
  const t = useTranslations("NotFoundPage");
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <Link href="/" className="underline">
        {t("backHome")}
      </Link>
    </main>
  );
}
