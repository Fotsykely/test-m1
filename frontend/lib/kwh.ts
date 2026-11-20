// Reads the text of a kWh field. A comma is accepted as the decimal separator.
// Returns null for an empty or non-numeric text: the API then answers that the field is required.
// A negative number is returned as is, so that the API gives the message about the allowed range.
export function parseKwh(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : null;
}
