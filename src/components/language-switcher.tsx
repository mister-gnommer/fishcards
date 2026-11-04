"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Links to the current page in the other language. Opening a prefixed URL makes the
 * middleware store that language in the cookie, so the choice is remembered without extra code.
 */
export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const other = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

  return (
    <nav aria-label={t("label")}>
      <Link href={pathname} locale={other} hrefLang={other} lang={other} className="underline">
        {t("switchTo")}
      </Link>
    </nav>
  );
}
