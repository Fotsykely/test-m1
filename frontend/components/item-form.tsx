"use client";

import { useActionState } from "react";
import { ButtonLink } from "@/components/button";
import { FormError, InputField, SelectField, TextAreaField } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { ITEM_STATUSES, type ItemInput } from "@/lib/api-client/types";
import { STATUS_LABELS } from "@/lib/format";
import { INITIAL_FORM_STATE, type FormState } from "@/lib/form-state";

type ItemFormProps = {
  action: (previousState: FormState, formData: FormData) => Promise<FormState>;
  initialValues: ItemInput;
  cancelHref: string;
};

// Shared by the "new item" and "edit item" pages. The API validates; this form only displays
// the messages it sends back under the matching field (noValidate turns the browser's own checks off).
export function ItemForm({ action, initialValues, cancelHref }: ItemFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_FORM_STATE);

  const values = state.status === "error" ? state.values : initialValues;
  const fieldErrors = state.status === "error" ? state.fieldErrors : {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.status === "error" && state.message && <FormError>{state.message}</FormError>}

      <InputField label="Nom" name="name" defaultValue={values.name} errors={fieldErrors.name} />
      <TextAreaField
        label="Description"
        name="description"
        optional
        defaultValue={values.description}
        errors={fieldErrors.description}
      />
      <SelectField label="Statut" name="status" defaultValue={values.status} errors={fieldErrors.status}>
        {ITEM_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </SelectField>

      <div className="flex flex-wrap gap-3">
        <SubmitButton>Enregistrer</SubmitButton>
        <ButtonLink href={cancelHref} variant="secondary">
          Annuler
        </ButtonLink>
      </div>
    </form>
  );
}
