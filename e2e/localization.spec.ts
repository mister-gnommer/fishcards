import { expect, test } from "@playwright/test";

const YEAR_SECONDS = 365 * 24 * 60 * 60;

test.describe("locale in the URL", () => {
  test("a prefixed page renders in its language and keeps its URL", async ({ page }) => {
    await page.goto("/pl");
    await expect(page).toHaveURL("/pl");
    await expect(page.getByText("Ucz się z fiszek")).toBeVisible();
  });

  test("an unsupported locale is not found", async ({ page }) => {
    const response = await page.goto("/de");
    expect(response?.status()).toBe(404);
  });

  test("the document language matches the locale", async ({ page }) => {
    await page.goto("/pl");
    await expect(page.locator("html")).toHaveAttribute("lang", "pl");
  });
});

test.describe("language detection for /", () => {
  test.use({ locale: "en-US" });

  test("a remembered choice wins over the browser language", async ({ page, context }) => {
    await context.addCookies([{ name: "NEXT_LOCALE", value: "pl", url: "http://localhost:8787" }]);
    await page.goto("/");
    await expect(page).toHaveURL("/pl");
  });
});

test.describe("first visit with a Polish browser", () => {
  test.use({ locale: "pl-PL" });

  test("redirects to Polish", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/pl");
  });
});

test.describe("first visit with an unsupported browser language", () => {
  // Playwright's default is en-US, which would pass this test without exercising the fallback.
  test.use({ locale: "de-DE" });

  test("falls back to English", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/en");
  });
});

test.describe("switching language", () => {
  test.use({ locale: "en-US" });

  test("opens the page in Polish and remembers it", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: "Polski" }).click();
    await expect(page).toHaveURL("/pl");

    await page.goto("/");
    await expect(page).toHaveURL("/pl");
  });

  test("the choice survives a browser restart", async ({ page, context, browser }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: "Polski" }).click();
    await expect(page).toHaveURL("/pl");

    const cookie = (await context.cookies()).find((c) => c.name === "NEXT_LOCALE");
    expect(cookie?.value).toBe("pl");
    // A session cookie has expires = -1; the spec needs about a year.
    expect(cookie?.expires).toBeGreaterThan(Date.now() / 1000 + YEAR_SECONDS - 24 * 60 * 60);

    const restarted = await browser.newContext({ locale: "en-US", baseURL: "http://localhost:8787" });
    if (cookie) {
      await restarted.addCookies([cookie]);
    }
    const restartedPage = await restarted.newPage();
    await restartedPage.goto("/");
    await expect(restartedPage).toHaveURL("/pl");
    await restarted.close();
  });
});
