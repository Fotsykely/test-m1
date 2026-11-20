// Mirrors the limits of the API (Consumption.YearMin and YearMax in backend/Api/Entities/Consumption.cs).
export const YEAR_MIN = 2000;
export const YEAR_MAX = 2100;

// Texts shown to users stay in French; identifiers and comments stay in English.
const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

// Month numbers are 1 to 12, as the API expects them.
export const MONTHS = MONTH_NAMES.map((name, index) => ({ number: index + 1, name }));

// Name of a month number between 1 and 12.
export function monthName(month: number): string {
  return MONTH_NAMES[month - 1];
}

// The month number when the text is a whole number from 1 to 12, otherwise null.
export function parseMonth(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d{1,2}$/.test(trimmed)) return null;

  const month = Number(trimmed);
  return month >= 1 && month <= 12 ? month : null;
}

// The year when the text is a four-digit number within the limits of the API, otherwise null.
export function parseYear(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d{4}$/.test(trimmed)) return null;

  const year = Number(trimmed);
  return year >= YEAR_MIN && year <= YEAR_MAX ? year : null;
}
