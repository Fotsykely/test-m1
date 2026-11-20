import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { listItems } from "@/lib/api-client/items";
import { ItemRow } from "./_components/item-row";

export default async function HomePage() {
  const items = await listItems();

  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Éléments</h1>
        <ButtonLink href="/items/new">
          <Plus aria-hidden className="size-4" />
          Nouvel élément
        </ButtonLink>
      </header>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-input p-6 text-center text-muted-foreground">
          Aucun élément pour le moment. Créez le premier avec le bouton « Nouvel élément ».
        </p>
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <ItemRow item={item} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
