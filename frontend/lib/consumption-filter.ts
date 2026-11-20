import type { ConsumptionFilter } from "./api-client/types";
import { parseMonth, parseYear } from "./period";
import { firstValue, type SearchParams } from "./search-params";

// Reads the filter of the entry list from its query string. A criterion that is missing, empty or invalid
// is ignored, as if it had not been chosen: a filter is never a reason to show an error page.
export function parseFilter(query: SearchParams): ConsumptionFilter {
  const filter: ConsumptionFilter = {};

  const roomId = parsePositiveInteger(firstValue(query.roomId));
  const month = parseMonth(firstValue(query.month));
  const year = parseYear(firstValue(query.year));

  if (roomId !== null) filter.roomId = roomId;
  if (month !== null) filter.month = month;
  if (year !== null) filter.year = year;
  return filter;
}

export function hasFilter(filter: ConsumptionFilter): boolean {
  return Object.keys(filter).length > 0;
}

// Identifies the criteria in use, to give the filter form a fresh state when they change.
export function filterKey(filter: ConsumptionFilter): string {
  return `${filter.roomId ?? ""}-${filter.month ?? ""}-${filter.year ?? ""}`;
}

function parsePositiveInteger(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;

  const value = Number(trimmed);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
