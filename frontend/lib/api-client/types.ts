// These types mirror the DTOs of the ASP.NET Core API (backend/Api/Dtos).
// When a DTO changes, update the matching type here.

// Validation messages per form field, with camelCase field names: { name: ["Le nom est obligatoire."] }
export type FieldErrors = Record<string, string[]>;
