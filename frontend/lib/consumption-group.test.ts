import { describe, expect, it } from "vitest";
import type { Consumption } from "@/lib/api-client/types";
import { groupByYear, totalMonth, YearTotals } from "./consumption-group";

let nextId = 1;

// An entry of Amphi A with the given period and kWh (10, 20 and 30 unless told otherwise).
function entry(year: number, month: number, kwh: Partial<Consumption> = {}): Consumption {
  return {
    id: nextId++,
    roomId: 1,
    roomName: "Amphi A",
    year,
    month,
    jiramaKwh: 10,
    solarKwh: 20,
    generatorKwh: 30,
    ...kwh,
  };
}

describe("totalMonth", () => {
  it("adds the three energies of the month", () => {
    expect(totalMonth(entry(2026, 4))).toBe(60);
  });

  it("gives 0 when nothing was consumed", () => {
    expect(totalMonth(entry(2026, 4, { jiramaKwh: 0, solarKwh: 0, generatorKwh: 0 }))).toBe(0);
  });

  it("keeps the decimals", () => {
    expect(totalMonth(entry(2026, 4, { jiramaKwh: 1.5, solarKwh: 2.25, generatorKwh: 0.25 }))).toBe(4);
  });
});

describe("groupByYear", () => {
  it("gives no group when there is no entry", () => {
    expect(groupByYear([])).toEqual([]);
  });

  it("puts the months of the same year in one group", () => {
    const november = entry(2026, 11);
    const april = entry(2026, 4);

    expect(groupByYear([november, april])).toEqual([{ year: 2026, consumptions: [november, april] }]);
  });

  it("makes one group per year, in the order of the entries (the API sends the newest first)", () => {
    const november2026 = entry(2026, 11);
    const april2026 = entry(2026, 4);
    const december2025 = entry(2025, 12);

    expect(groupByYear([november2026, april2026, december2025])).toEqual([
      { year: 2026, consumptions: [november2026, april2026] },
      { year: 2025, consumptions: [december2025] },
    ]);
  });

  it("keeps the order of the months inside a group", () => {
    const march = entry(2026, 3);
    const february = entry(2026, 2);
    const january = entry(2026, 1);

    expect(groupByYear([march, february, january])[0].consumptions).toEqual([march, february, january]);
  });
});

describe("YearTotals", () => {
  it("gives zeros for a year without entry", () => {
    expect(YearTotals({ year: 2026, consumptions: [] })).toEqual({
      jiramaKwh: 0,
      solarKwh: 0,
      generatorKwh: 0,
      total: 0,
    });
  });

  it("sums each column over the months of the year", () => {
    const november = entry(2026, 11, { jiramaKwh: 1, solarKwh: 23, generatorKwh: 11 });
    const april = entry(2026, 4, { jiramaKwh: 230, solarKwh: 100, generatorKwh: 23 });

    expect(YearTotals({ year: 2026, consumptions: [november, april] })).toEqual({
      jiramaKwh: 231,
      solarKwh: 123,
      generatorKwh: 34,
      total: 388,
    });
  });

  it("gives a total equal to the sum of the three columns", () => {
    const totals = YearTotals({ year: 2026, consumptions: [entry(2026, 1), entry(2026, 2), entry(2026, 3)] });

    expect(totals.total).toBe(totals.jiramaKwh + totals.solarKwh + totals.generatorKwh);
  });
});
