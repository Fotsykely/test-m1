import type { FieldErrors } from "./api-client/types";

// What the submitted fields contained, used to refill the form after an error.
export type FormValues = Record<string, string>;

// Result of a form Server Action, read by the form through useActionState.
// "idle" is the initial state and also the result of a success that keeps the user on the same page
// (the form then shows its initial values again); other successes redirect.
export type FormState =
  | { status: "idle" }
  | { status: "error"; message: string | null; fieldErrors: FieldErrors; values: FormValues };

export const INITIAL_FORM_STATE: FormState = { status: "idle" };
