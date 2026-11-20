import { CircleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

// A form field: visible label, optional hint, and the error messages shown right under the control.
// The field name doubles as the element id, so a name must be unique within a page.

type FieldProps = {
  label: string;
  name: string;
  hint?: string;
  optional?: boolean;
  errors?: string[];
};

const CONTROL_CLASSES = "min-h-11 w-full rounded-md border bg-surface px-3 py-2 text-base text-foreground";

export function InputField({ label, hint, optional, errors, ...input }: FieldProps & ComponentProps<"input">) {
  return (
    <FieldShell label={label} name={input.name} hint={hint} optional={optional} errors={errors}>
      <input type="text" className={controlClassName(errors)} {...controlAttributes(input.name, hint, errors)} {...input} />
    </FieldShell>
  );
}

export function TextAreaField({ label, hint, optional, errors, ...textarea }: FieldProps & ComponentProps<"textarea">) {
  return (
    <FieldShell label={label} name={textarea.name} hint={hint} optional={optional} errors={errors}>
      <textarea
        rows={4}
        className={controlClassName(errors)}
        {...controlAttributes(textarea.name, hint, errors)}
        {...textarea}
      />
    </FieldShell>
  );
}

export function SelectField({ label, hint, optional, errors, ...select }: FieldProps & ComponentProps<"select">) {
  return (
    <FieldShell label={label} name={select.name} hint={hint} optional={optional} errors={errors}>
      <select className={controlClassName(errors)} {...controlAttributes(select.name, hint, errors)} {...select} />
    </FieldShell>
  );
}

// Message for an error that belongs to the whole form rather than to one field.
export function FormError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}

function FieldShell({ label, name, hint, optional, errors, children }: FieldProps & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold">
        {label}
        {optional && <span className="font-normal text-muted-foreground"> (facultatif)</span>}
      </label>
      {children}
      {hint && (
        <p id={`${name}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {errors && errors.length > 0 && (
        <div id={`${name}-error`} className="flex flex-col gap-1">
          {errors.map((message) => (
            <FormError key={message}>{message}</FormError>
          ))}
        </div>
      )}
    </div>
  );
}

function controlClassName(errors?: string[]): string {
  const borderClass = errors && errors.length > 0 ? "border-destructive" : "border-border-input";
  return `${CONTROL_CLASSES} ${borderClass}`;
}

// Links the control to its hint and error messages for screen readers.
function controlAttributes(name: string, hint?: string, errors?: string[]) {
  const hasErrors = errors !== undefined && errors.length > 0;
  const describedBy = [hint ? `${name}-hint` : null, hasErrors ? `${name}-error` : null].filter(Boolean).join(" ");

  return {
    id: name,
    "aria-invalid": hasErrors || undefined,
    "aria-describedby": describedBy || undefined,
  };
}
