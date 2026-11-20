import type { Metadata } from "next";
import { ItemForm } from "@/components/item-form";
import { createItemAction } from "../actions";

export const metadata: Metadata = { title: "Nouvel élément" };

export default function NewItemPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Nouvel élément</h1>
      <ItemForm
        action={createItemAction}
        initialValues={{ name: "", description: "", status: "Draft" }}
        cancelHref="/"
      />
    </>
  );
}
