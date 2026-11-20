import { apiFetch, apiFetchNoContent, jsonRequest } from "./client";
import type { Item, ItemInput } from "./types";

// One small function per endpoint of ItemsController. Pages and Server Actions call these
// and never deal with fetch or status codes.

export function listItems(): Promise<Item[]> {
  return apiFetch("/api/items");
}

export function getItem(id: number): Promise<Item> {
  return apiFetch(`/api/items/${id}`);
}

export function createItem(input: ItemInput): Promise<Item> {
  return apiFetch("/api/items", jsonRequest("POST", input));
}

export function updateItem(id: number, input: ItemInput): Promise<Item> {
  return apiFetch(`/api/items/${id}`, jsonRequest("PUT", input));
}

export function deleteItem(id: number): Promise<void> {
  return apiFetchNoContent(`/api/items/${id}`, { method: "DELETE" });
}
