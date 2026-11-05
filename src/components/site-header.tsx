import { getSessionUser } from "@/auth/session";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SignOutButton } from "@/components/sign-out-button";

/** Header on every page: the signed-in user's email and sign-out, plus the language switcher. */
export async function SiteHeader() {
  const user = await getSessionUser();
  return (
    <header className="flex items-center justify-end gap-4 p-4">
      {user && (
        <>
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <SignOutButton />
        </>
      )}
      <LanguageSwitcher />
    </header>
  );
}
