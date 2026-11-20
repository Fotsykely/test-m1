import { Pencil } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { ConfirmDelete } from "@/components/confirm-delete";
import type { Item } from "@/lib/api-client/types";
import { STATUS_LABELS, formatDate } from "@/lib/format";
import { deleteItemAction } from "../items/actions";

// An item on the home page, with its edit and delete buttons.
export function ItemRow({ item }: { item: Item }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="min-w-0">
        <h2 className="break-words font-semibold">{item.name}</h2>
        {item.description && (
          <p className="mt-1 line-clamp-2 break-words text-sm text-muted-foreground">{item.description}</p>
        )}
        <p className="mt-3 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
          {/* The status is always a text label, never colour alone. */}
          <span className="font-medium text-foreground">{STATUS_LABELS[item.status]}</span>
          <span>Créé le {formatDate(item.createdAt)}</span>
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <ButtonLink href={`/items/${item.id}/edit`} variant="secondary" aria-label={`Modifier ${item.name}`}>
          <Pencil aria-hidden className="size-4" />
        </ButtonLink>
        <ConfirmDelete
          iconOnly
          triggerLabel={`Supprimer ${item.name}`}
          title="Supprimer cet élément ?"
          description={`« ${item.name} » sera supprimé définitivement.`}
          confirmLabel="Supprimer"
          action={deleteItemAction.bind(null, item.id)}
        />
      </div>
    </div>
  );
}
