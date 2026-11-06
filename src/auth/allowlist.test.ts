import { describe, expect, it } from "vitest";
import { isAllowed } from "./allowlist";

describe("isAllowed", () => {
  it("admits a verified email on the list, ignoring case and spaces", () => {
    expect(isAllowed("ann@example.com", true, " Ann@Example.com , bob@example.com")).toBe(true);
  });

  it("rejects an email that is not on the list", () => {
    expect(isAllowed("eve@example.com", true, "ann@example.com")).toBe(false);
  });

  it("rejects an unverified email even when it is on the list", () => {
    expect(isAllowed("ann@example.com", false, "ann@example.com")).toBe(false);
  });

  it("admits no one when the list is empty or missing", () => {
    expect(isAllowed("ann@example.com", true, "")).toBe(false);
    expect(isAllowed("ann@example.com", true, undefined)).toBe(false);
    // A trailing comma must not let an empty email through.
    expect(isAllowed("", true, "ann@example.com,")).toBe(false);
  });

  it("rejects a missing email", () => {
    expect(isAllowed(undefined, true, "ann@example.com")).toBe(false);
  });
});
