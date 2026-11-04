import { notFound } from "next/navigation";

// Unknown paths under a locale (e.g. /en/de after the middleware redirect) get the localized 404.
export default function CatchAllPage() {
  notFound();
}
