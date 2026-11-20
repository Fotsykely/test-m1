import { apiFetch, jsonRequest } from "./client";
import type { Consumption, ConsumptionValues, NewConsumption } from "./types";

// The entry of a room for a month, or null when none has been saved yet (there is at most one).
export async function findConsumption(roomId: number, month: number, year: number): Promise<Consumption | null> {
  const query = new URLSearchParams({ roomId: String(roomId), year: String(year), month: String(month) });
  const [consumption] = await apiFetch<Consumption[]>(`/api/consumptions?${query}`);
  return consumption ?? null;
}

// Throws ApiConflictError when the room already has an entry for that month.
export function createConsumption(input: NewConsumption): Promise<Consumption> {
  return apiFetch<Consumption>("/api/consumptions", jsonRequest("POST", input));
}

// Only the values change: the room, year and month identify the entry.
export function updateConsumption(id: number, values: ConsumptionValues): Promise<Consumption> {
  return apiFetch<Consumption>(`/api/consumptions/${id}`, jsonRequest("PUT", values));
}
