// A query parameter is a string, a list when it is repeated in the URL, or missing.
export type SearchParams = Record<string, string | string[] | undefined>;

// The first value of a query parameter, or "" when it is missing.
export function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}
