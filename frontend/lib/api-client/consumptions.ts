import { apiFetch, apiFetchNoContent, jsonRequest } from "./client";
import type { Consumption, ConsumptionFilter, ConsumptionValues, NewConsumption, RoomSummary } from "./types";

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

// The entries, newest period first. Without criteria, every entry.
export function listConsumptions(filter: ConsumptionFilter = {}): Promise<Consumption[]> {
  const query = new URLSearchParams();
  if (filter.roomId !== undefined) query.set("roomId", String(filter.roomId));
  if (filter.month !== undefined) query.set("month", String(filter.month));
  if (filter.year !== undefined) query.set("year", String(filter.year));

  const queryString = query.toString();
  return apiFetch<Consumption[]>(`/api/consumptions${queryString ? `?${queryString}` : ""}`);
}

// Throws ApiNotFoundError when the entry does not exist (anymore).
export function deleteConsumption(id: number): Promise<void> {
  return apiFetchNoContent(`/api/consumptions/${id}`, { method: "DELETE" });
}

// One row per room, with its kWh summed over every month entered (zeros for a room without entry).
export function listRoomSummaries(year?: number): Promise<RoomSummary[]> {
  return apiFetch<RoomSummary[]>(`/api/consumptions/summary?year=${year}`);
}
