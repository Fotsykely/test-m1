import { describe, expect, it } from "vitest";
import { parseKwh } from "./kwh";

describe("parseKwh", () => {
  it("reads whole and decimal numbers, with a dot or a comma", () => {
    expect(parseKwh("1200")).toBe(1200);
    expect(parseKwh("12.5")).toBe(12.5);
    expect(parseKwh("12,5")).toBe(12.5);
    expect(parseKwh(" 0 ")).toBe(0);
  });

  it("keeps a negative number so that the API explains the allowed range", () => {
    expect(parseKwh("-5")).toBe(-5);
  });

  it("keeps more than two decimals: the API rounds them", () => {
    expect(parseKwh("12.345")).toBe(12.345);
  });

  it.each(["", "  ", "abc", "1e3", "12.", ".5", "1 000", "12,5,3"])("returns null for %j", (text) => {
    expect(parseKwh(text)).toBeNull();
  });
});
