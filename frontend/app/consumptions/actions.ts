"use server";

import { ApiNotFoundError } from "@/lib/api-client/client";
import { deleteConsumption } from "@/lib/api-client/consumptions";
import { revalidateAllPages } from "@/lib/revalidate";

// Bound to the entry id by the list: deleteConsumptionAction.bind(null, consumption.id).
// The list stays on screen: once the pages are revalidated, the deleted row is simply gone.
export async function deleteConsumptionAction(consumptionId: number): Promise<void> {
  try {
    await deleteConsumption(consumptionId);
  } catch (error) {
    // Already deleted (for example in another tab): the goal is reached, so carry on.
    if (!(error instanceof ApiNotFoundError)) throw error;
  }

  revalidateAllPages();
}
