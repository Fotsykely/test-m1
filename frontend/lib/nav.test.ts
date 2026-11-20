import { describe, expect, it } from "vitest";
import { NAV_ITEMS } from "./nav";

function activeLabels(pathname: string): string[] {
  return NAV_ITEMS.filter((item) => item.isActive(pathname)).map((item) => item.label);
}

describe("navigation menu", () => {
  it("links to the room list, the entry list and the result", () => {
    expect(NAV_ITEMS.map((item) => [item.label, item.href])).toEqual([
      ["Saisie", "/"],
      ["Liste", "/consumptions"],
      ["Résultat", "/results"],
    ]);
  });

  it("highlights exactly one entry on each page", () => {
    expect(activeLabels("/")).toEqual(["Saisie"]);
    expect(activeLabels("/consumptions")).toEqual(["Liste"]);
    expect(activeLabels("/results")).toEqual(["Résultat"]);
  });

  it("keeps Saisie highlighted on the entry form, which the room list leads to", () => {
    expect(activeLabels("/consumptions/entry")).toEqual(["Saisie"]);
  });

  it("highlights nothing on an unknown page", () => {
    expect(activeLabels("/nope")).toEqual([]);
  });
});
