import { describe, expect, it } from "vitest";
import { MONTHS, monthName, parseMonth, parseYear } from "./period";

describe("months", () => {
  it("lists the twelve months numbered from 1 to 12, starting with January", () => {
    expect(MONTHS).toHaveLength(12);
    expect(MONTHS[0]).toEqual({ number: 1, name: "Janvier" });
    expect(MONTHS[11]).toEqual({ number: 12, name: "Décembre" });
  });
});

describe("parseMonth", () => {
  it("accepts the numbers 1 to 12, with or without a leading zero", () => {
    expect(parseMonth("1")).toBe(1);
    expect(parseMonth("01")).toBe(1);
    expect(parseMonth("12")).toBe(12);
  });

  it.each(["", "0", "13", "abc", "1.5", "-1", "111"])("rejects %j", (text) => {
    expect(parseMonth(text)).toBeNull();
  });

  it("gives the name of a month from its number", () => {
    expect(monthName(1)).toBe("Janvier");
    expect(monthName(11)).toBe("Novembre");
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
