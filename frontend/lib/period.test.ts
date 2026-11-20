import { describe, expect, it } from "vitest";
import { MONTHS, parseYear } from "./period";

describe("months", () => {
  it("lists the twelve months numbered from 1 to 12, starting with January", () => {
    expect(MONTHS).toHaveLength(12);
    expect(MONTHS[0]).toEqual({ number: 1, name: "Janvier" });
    expect(MONTHS[11]).toEqual({ number: 12, name: "Décembre" });
  });
});

describe("parseYear", () => {
  it("accepts a four-digit year within the limits of the API", () => {
    expect(parseYear("2026")).toBe(2026);
    expect(parseYear("2000")).toBe(2000);
    expect(parseYear("2100")).toBe(2100);
  });

  it("ignores surrounding spaces", () => {
    expect(parseYear(" 2026 ")).toBe(2026);
  });

  it.each(["", "  ", "abc", "26", "20260", "1999", "2101", "2026.5", "-2026", "2e3"])(
    "rejects %j",
    (text) => {
      expect(parseYear(text)).toBeNull();
    },
  );
});
