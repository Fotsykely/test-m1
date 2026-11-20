import { describe, expect, it } from "vitest";
import { filterKey, hasFilter, parseFilter } from "./consumption-filter";
import { firstValue } from "./search-params";

describe("parseFilter", () => {
  it("reads the room, the month and the year", () => {
    expect(parseFilter({ roomId: "5", month: "6", year: "2026" })).toEqual({ roomId: 5, month: 6, year: 2026 });
  });

  it("returns no criterion when nothing is chosen", () => {
    expect(parseFilter({})).toEqual({});
  });

  it("ignores the empty values a submitted form sends for unchosen fields", () => {
    expect(parseFilter({ roomId: "", month: "", year: "" })).toEqual({});
    expect(parseFilter({ roomId: "5", month: "", year: "" })).toEqual({ roomId: 5 });
  });

  // Each query has one invalid criterion; the valid one next to it must survive.
  it.each([
    [{ roomId: "abc", month: "3" }, { month: 3 }],
    [{ roomId: "0", month: "3" }, { month: 3 }],
    [{ roomId: "-1", month: "3" }, { month: 3 }],
    [{ roomId: "1.5", month: "3" }, { month: 3 }],
    [{ roomId: "99999999999999999999", month: "3" }, { month: 3 }],
    [{ month: "13", year: "2026" }, { year: 2026 }],
    [{ month: "0", year: "2026" }, { year: 2026 }],
    [{ year: "1999", roomId: "2" }, { roomId: 2 }],
    [{ year: "20", roomId: "2" }, { roomId: 2 }],
  ])("ignores the invalid criterion of %j", (query, expected) => {
    expect(parseFilter(query)).toEqual(expected);
  });

  it("uses the first value of a parameter repeated in the URL", () => {
    expect(parseFilter({ month: ["3", "4"] })).toEqual({ month: 3 });
  });
});

describe("hasFilter and filterKey", () => {
  it("tells whether a criterion is in use", () => {
    expect(hasFilter({})).toBe(false);
    expect(hasFilter({ month: 6 })).toBe(true);
  });

  it("gives a different key to different criteria", () => {
    expect(filterKey({})).toBe("--");
    expect(filterKey({ roomId: 5, month: 6, year: 2026 })).toBe("5-6-2026");
    expect(filterKey({ month: 6 })).not.toBe(filterKey({ year: 6 }));
  });
});

describe("firstValue", () => {
  it("returns a string as is, the first of a list, or an empty text when missing", () => {
    expect(firstValue("abc")).toBe("abc");
    expect(firstValue(["a", "b"])).toBe("a");
    expect(firstValue([])).toBe("");
    expect(firstValue(undefined)).toBe("");
  });
});
