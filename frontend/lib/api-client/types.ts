// These types mirror the DTOs of the ASP.NET Core API (backend/Api/Dtos).
// When a DTO changes, update the matching type here.

export const ITEM_STATUSES = ["Draft", "Active", "Archived"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export interface Item {
  id: number;
  name: string;
  description: string | null;
  status: ItemStatus;
  createdAt: string; // ISO 8601 date and time
}

// Request body. An empty description is turned into "no description" by the API.
export type ItemInput = {
  name: string;
  description: string;
  status: ItemStatus;
};

// Validation messages per form field, with camelCase field names: { name: ["Le nom est obligatoire."] }
export type FieldErrors = Record<string, string[]>;
