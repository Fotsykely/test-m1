const kwhFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

// 1200.5 → "1 200,5". The API stores 2 decimals at most.
export function formatKwh(value: number): string {
  return kwhFormatter.format(value);
}
