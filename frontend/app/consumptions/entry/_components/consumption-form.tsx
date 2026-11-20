"use client";

import { useActionState } from "react";
import { ButtonLink } from "@/components/button";
import { FormError, InputField } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { INITIAL_FORM_STATE, type FormState } from "@/lib/form-state";

type ConsumptionFormProps = {
  action: (previousState: FormState, formData: FormData) => Promise<FormState>;
  // The kWh already saved for this room and month, as text; empty strings for a new entry.
  initialValues: { jiramaKwh: string; solarKwh: string; generatorKwh: string };
  cancelHref: string;
};

// The API validates; this form only displays the messages it sends back under the matching field
// (noValidate turns the browser's own checks off).
export function ConsumptionForm({ action, initialValues, cancelHref }: ConsumptionFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_FORM_STATE);

  const values = state.status === "error" ? state.values : initialValues;
  const fieldErrors = state.status === "error" ? state.fieldErrors : {};

  return (
    <form action={formAction} noValidate className="flex max-w-md flex-col gap-5">
      {state.status === "error" && state.message && <FormError>{state.message}</FormError>}

      <KwhField label="Jirama (kWh)" name="jiramaKwh" defaultValue={values.jiramaKwh} errors={fieldErrors.jiramaKwh} />
      <KwhField label="Solaire (kWh)" name="solarKwh" defaultValue={values.solarKwh} errors={fieldErrors.solarKwh} />
      <KwhField
        label="Groupe électrogène (kWh)"
        name="generatorKwh"
        defaultValue={values.generatorKwh}
        errors={fieldErrors.generatorKwh}
      />

      <div className="flex flex-wrap gap-3">
        <SubmitButton>Valider</SubmitButton>
        <ButtonLink href={cancelHref} variant="secondary">
          Annuler
        </ButtonLink>
      </div>
    </form>
  );
}

type KwhFieldProps = { label: string; name: string; defaultValue: string; errors?: string[] };

function KwhField({ label, name, defaultValue, errors }: KwhFieldProps) {
  return (
    <InputField
      label={label}
      name={name}
      type="number"
      inputMode="decimal"
      step="0.01"
      min="0"
      defaultValue={defaultValue}
      errors={errors}
    />
  );
}
