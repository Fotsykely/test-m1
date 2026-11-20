import { apiFetch } from "./client";
import type { Room } from "./types";

export function listRooms(): Promise<Room[]> {
  return apiFetch<Room[]>("/api/rooms");
}

// Throws ApiNotFoundError for an unknown room.
export function getRoom(id: number): Promise<Room> {
  return apiFetch<Room>(`/api/rooms/${id}`);
}
