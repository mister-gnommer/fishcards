import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pl"],
  defaultLocale: "en",
  localePrefix: "always",
  // next-intl's cookie is session-only by default; the spec requires the choice to survive restarts.
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
});
