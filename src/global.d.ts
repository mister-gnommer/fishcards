import type messages from "../messages/en.json";
import type { routing } from "./i18n/routing";

// English is the source of truth: a key missing from en.json is a type error at every `t()` call.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
