import { apiFetch } from "./client";
import type { Room } from "./types";

export function listRooms(): Promise<Room[]> {
  return apiFetch<Room[]>("/api/rooms");
}
