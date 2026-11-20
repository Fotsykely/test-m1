import type { Metadata } from "next";
import { Suspense } from "react";
import { ItemForm } from "@/components/item-form";
import { getItem } from "@/lib/api-client/items";
import { orNotFound, parseRouteId } from "@/lib/route-helpers";
import { updateItemAction } from "../../actions";

export const metadata: Metadata = { title: "Modifier l'élément" };

type EditItemPageProps = PageProps<"/items/[itemId]/edit">;

// The page itself renders instantly (static heading). Reading `params` and calling the API happen in a
// child inside its own <Suspense>: with Cache Components, a boundary above the shared layout (the root
// loading.tsx) does not give an instant fallback on a client navigation to this route.
export default function EditItemPage(props: EditItemPageProps) {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Modifier l&apos;élément</h1>
      <Suspense fallback={<ItemFormSkeleton />}>
        <EditItemForm params={props.params} />
      </Suspense>
    </>
  );
}

async function EditItemForm({ params }: { params: EditItemPageProps["params"] }) {
  const { itemId } = await params;
  const id = parseRouteId(itemId);
  const item = await orNotFound(getItem(id));

  return (
    <ItemForm
      action={updateItemAction.bind(null, item.id)}
      initialValues={{ name: item.name, description: item.description ?? "", status: item.status }}
      cancelHref="/"
    />
  );
}

// Same rough shape as the form (three fields and the buttons), so the page does not jump.
function ItemFormSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div aria-hidden className="flex flex-col gap-5">
        <div className="h-16 rounded-md bg-border" />
        <div className="h-32 rounded-md bg-border" />
        <div className="h-16 rounded-md bg-border" />
        <div className="h-11 w-40 rounded-md bg-border" />
      </div>
    </div>
  );
}
