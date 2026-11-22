// These types mirror the DTOs of the ASP.NET Core API (backend/Api/Dtos).
// When a DTO changes, update the matching type here.

export interface Room {
  id: number;
  name: string;
}

export interface Consumption {
  id: number;
  roomId: number;
  roomName: string;
  year: number;
  month: number; // 1 to 12
  jiramaKwh: number;
  solarKwh: number;
  generatorKwh: number;
}

// Optional criteria of the entry list: they mirror the query parameters of GET /api/consumptions.
export type ConsumptionFilter = { roomId?: number; month?: number; year?: number };

// optional criteria of the entry list of summary
export type RoomSummaryFilter = { year?: number };

// One row of the result table: the kWh of a room over every month entered.
export interface RoomSummary {
  roomId: number;
  roomName: string;
  jiramaKwh: number;
  solarKwh: number;
  generatorKwh: number;
  totalKwh: number;
}

// The three kWh values of an entry. null when a field was left empty: the API then says it is required.
export type ConsumptionValues = {
  jiramaKwh: number | null;
  solarKwh: number | null;
  generatorKwh: number | null;
};

// Request body to create an entry. Once created, only the values can change.
export type NewConsumption = ConsumptionValues & { roomId: number; year: number; month: number };

// Validation messages per form field, with camelCase field names: { name: ["Le nom est obligatoire."] }
export type FieldErrors = Record<string, string[]>;
