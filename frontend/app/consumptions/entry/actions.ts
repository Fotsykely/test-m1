"use server";

import { redirect } from "next/navigation";
import { ApiConflictError, ApiNotFoundError } from "@/lib/api-client/client";
import { createConsumption, updateConsumption } from "@/lib/api-client/consumptions";
import { readText } from "@/lib/form-data";
import { toFormState } from "@/lib/form-errors";
import type { FormState, FormValues } from "@/lib/form-state";
import { parseKwh } from "@/lib/kwh";
import { revalidateAllPages } from "@/lib/revalidate";

// Form field names, used to keep only the API messages that belong to this form.
const FIELDS = ["jiramaKwh", "solarKwh", "generatorKwh"] as const;

const STALE_ENTRY_MESSAGE =
  "Cette saisie a changé entre-temps (créée, modifiée ou supprimée ailleurs). Rechargez la page, puis recommencez.";

// What the page knows about the entry being edited: bound by the page, never read from the form.
// consumptionId is null while the room has no entry for that month.
type EntryTarget = { roomId: number; month: number; year: number; consumptionId: number | null };

// Creates the entry, or updates it when the page found one: bound by the page with
// saveConsumptionAction.bind(null, target). The action stays thin: read the form, call the API client,
// then redirect or return the errors. redirect() works by throwing, so it is called outside the try/catch.
export async function saveConsumptionAction(
  target: EntryTarget,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readValues(formData);
  const kwh = {
    jiramaKwh: parseKwh(values.jiramaKwh),
    solarKwh: parseKwh(values.solarKwh),
    generatorKwh: parseKwh(values.generatorKwh),
  };

  try {
    if (target.consumptionId === null) {
      await createConsumption({ roomId: target.roomId, year: target.year, month: target.month, ...kwh });
    } else {
      await updateConsumption(target.consumptionId, kwh);
    }
  } catch (error) {
    // Someone else saved or deleted the entry since the page was loaded.
    if (error instanceof ApiConflictError || error instanceof ApiNotFoundError) {
      return { status: "error", message: STALE_ENTRY_MESSAGE, fieldErrors: {}, values };
    }
    return toFormState(error, FIELDS, values);
  }

  revalidateAllPages();
  redirect("/");
}

function readValues(formData: FormData): FormValues {
  return {
    jiramaKwh: readText(formData, "jiramaKwh"),
    solarKwh: readText(formData, "solarKwh"),
    generatorKwh: readText(formData, "generatorKwh"),
  };
}
