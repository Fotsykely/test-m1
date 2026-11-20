import { describe, expect, it } from "vitest";
import { formatKwh } from "./format";

// The thousands separator is a no-break space whose exact character depends on the ICU version.
function withPlainSpaces(text: string): string {
  return text.replace(/\s/g, " ");
}

describe("formatKwh", () => {
  it("uses a space for thousands and a comma for decimals", () => {
    expect(withPlainSpaces(formatKwh(1200.5))).toBe("1 200,5");
    expect(withPlainSpaces(formatKwh(1234567.89))).toBe("1 234 567,89");
  });

  it("shows whole numbers and zero without decimals", () => {
    expect(formatKwh(80)).toBe("80");
    expect(formatKwh(0)).toBe("0");
  });

  it("keeps two decimals at most", () => {
    expect(formatKwh(0.126)).toBe("0,13");
  });
});
