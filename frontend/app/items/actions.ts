"use server";

import { redirect } from "next/navigation";
import { ApiNotFoundError } from "@/lib/api-client/client";
import { createItem, deleteItem, updateItem } from "@/lib/api-client/items";
import { ITEM_STATUSES, type ItemInput, type ItemStatus } from "@/lib/api-client/types";
import { readText } from "@/lib/form-data";
import { toFormState } from "@/lib/form-errors";
import type { FormState } from "@/lib/form-state";
import { revalidateAllPages } from "@/lib/revalidate";

// Form field names, used to keep only the API messages that belong to this form.
const ITEM_FIELDS = ["name", "description", "status"] as const;

// These actions stay thin: read the form, call the API client, then redirect or return the errors.
// redirect() works by throwing, so it is always called outside the try/catch blocks.

export async function createItemAction(_previousState: FormState, formData: FormData): Promise<FormState> {
  const input = readItemInput(formData);

  try {
    await createItem(input);
  } catch (error) {
    return toFormState(error, ITEM_FIELDS, input);
  }

  revalidateAllPages();
  redirect("/");
}

// Bound to the item id by the edit page: updateItemAction.bind(null, item.id).
export async function updateItemAction(
  itemId: number,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = readItemInput(formData);

  try {
    await updateItem(itemId, input);
  } catch (error) {
    return toFormState(error, ITEM_FIELDS, input);
  }

  revalidateAllPages();
  redirect("/");
}

export async function deleteItemAction(itemId: number): Promise<void> {
  try {
    await deleteItem(itemId);
  } catch (error) {
    // Already deleted (for example in another tab): the goal is reached, so carry on.
    if (!(error instanceof ApiNotFoundError)) throw error;
  }

  revalidateAllPages();
  redirect("/");
}

function readItemInput(formData: FormData): ItemInput {
  return {
    name: readText(formData, "name"),
    description: readText(formData, "description"),
    status: readStatus(formData),
  };
}

// An unknown value cannot come from our <select>; fall back to the default and let the API have the last word.
function readStatus(formData: FormData): ItemStatus {
  const value = readText(formData, "status");
  return (ITEM_STATUSES as readonly string[]).includes(value) ? (value as ItemStatus) : "Draft";
}
