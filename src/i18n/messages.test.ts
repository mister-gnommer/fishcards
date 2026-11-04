import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import pl from "../../messages/pl.json";

/**
 * Lists every leaf key as a dotted path, e.g. `HomePage.title`.
 * @param messages a translations object, possibly nested
 * @param prefix path of the object being walked
 */
function leafKeys(messages: object, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? leafKeys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe("translations", () => {
  it("define the same texts in English and Polish", () => {
    expect(leafKeys(pl).sort()).toEqual(leafKeys(en).sort());
  });
});
