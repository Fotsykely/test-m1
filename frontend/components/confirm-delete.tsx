"use client";

import { useId, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { SubmitButton } from "@/components/submit-button";

type ConfirmDeleteProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  // Server Action bound to the id of the item to delete.
  action: (formData: FormData) => Promise<void>;
  // Icon-only trigger for compact rows; the label stays available to screen readers.
  iconOnly?: boolean;
};

// A delete button that asks for confirmation in a native modal <dialog> before submitting.
export function ConfirmDelete({
  triggerLabel,
  title,
  description,
  confirmLabel,
  action,
  iconOnly = false,
}: ConfirmDeleteProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <Button
        type="button"
        variant="danger"
        aria-label={iconOnly ? triggerLabel : undefined}
        onClick={() => dialogRef.current?.showModal()}
      >
        <Trash2 aria-hidden className="size-4" />
        {!iconOnly && triggerLabel}
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-border bg-surface p-6 text-foreground shadow-sm backdrop:bg-foreground/40"
      >
        <form action={action} className="flex flex-col gap-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <p className="text-muted-foreground">{description}</p>
          <div className="flex flex-wrap gap-3">
            <SubmitButton variant="destructive" pendingLabel="Suppression…">
              {confirmLabel}
            </SubmitButton>
            <Button type="button" variant="secondary" onClick={() => dialogRef.current?.close()}>
              Annuler
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
