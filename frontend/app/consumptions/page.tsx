import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button";
import { ConfirmDelete } from "@/components/confirm-delete";
import { listConsumptions } from "@/lib/api-client/consumptions";
// import { listRooms } from "@/lib/api-client/rooms"; // filter (hidden)
import type { Consumption } from "@/lib/api-client/types";
import { hasFilter, parseFilter } from "@/lib/consumption-filter"; // + filterKey for the filter (hidden)
import { formatKwh } from "@/lib/format";
import { monthName } from "@/lib/period";
import { deleteConsumptionAction } from "./actions";
// import { ConsumptionFilterForm } from "./_components/consumption-filter-form"; // filter (hidden)

export const metadata: Metadata = { title: "Liste des saisies" };

type ConsumptionsPageProps = PageProps<"/consumptions">;

// The heading renders at once; the query string and the API are read in a child inside its own <Suspense>
// (see the README, "Pièges Next.js 16").
export default function ConsumptionsPage(props: ConsumptionsPageProps) {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Liste des saisies</h1>
      <Suspense fallback={<ListSkeleton />}>
        <ConsumptionList searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function ConsumptionList({ searchParams }: { searchParams: ConsumptionsPageProps["searchParams"] }) {
  const filter = parseFilter(await searchParams);
  const filtered = hasFilter(filter);
  const consumptions = await listConsumptions(filter);
  // filter (hidden): const [rooms, consumptions] = await Promise.all([listRooms(), listConsumptions(filter)]);

  // Nothing entered at all: there is nothing to filter yet.
  if (consumptions.length === 0 && !filtered) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-border-input p-6">
        <p className="text-muted-foreground">Aucune saisie pour le moment.</p>
        <ButtonLink href="/">Saisir une consommation</ButtonLink>
      </div>
    );
  }

  return (
    <>
      {/* Filter (hidden): the subject's list screen has none. To show it again, uncomment the lines marked
          "filter (hidden)" (the two imports, the fetch above and filterKey in the lib import) and this form.
          The key gives each set of criteria its own form: when the URL changes through the app, the fields
          show the new criteria instead of what was typed before.
      <ConsumptionFilterForm key={filterKey(filter)} rooms={rooms} filter={filter} />
      */}
      {consumptions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-input p-6 text-muted-foreground">
          Aucune saisie pour ce filtre.
        </p>
      ) : (
        <ConsumptionTable consumptions={consumptions} />
      )}
    </>
  );
}

function ConsumptionTable({ consumptions }: { consumptions: Consumption[] }) {
  // "relative" makes this box the containing block of the absolutely positioned sr-only texts of the rows:
  // without it they escape the scroll area and widen the whole page on a phone.
  return (
    <div className="relative overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
      <table className="w-full min-w-[44rem] text-left">
        <caption className="sr-only">Consommation en kWh par salle et par mois</caption>
        <thead className="border-b border-border bg-background text-sm text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2 font-semibold">Salle</th>
            <th scope="col" className="px-4 py-2 font-semibold">Mois / année</th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">Jirama (kWh)</th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">Solaire (kWh)</th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">Groupe électrogène (kWh)</th>
            <th scope="col" className="px-4 py-2 font-semibold">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {consumptions.map((consumption) => (
            <ConsumptionRow key={consumption.id} consumption={consumption} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConsumptionRow({ consumption }: { consumption: Consumption }) {
  const period = `${monthName(consumption.month)} ${consumption.year}`;
  // Names the row for screen readers: every row has the same visible "Modifier" and "Supprimer".
  const target = `la saisie de ${consumption.roomName}, ${period}`;
  // The entry page pre-fills the form when the room already has an entry for that month.
  const editHref = `/consumptions/entry?roomId=${consumption.roomId}&month=${consumption.month}&year=${consumption.year}`;

  return (
    <tr className="border-t border-border first:border-t-0">
      <th scope="row" className="px-4 py-2 font-medium">{consumption.roomName}</th>
      <td className="whitespace-nowrap px-4 py-2">{period}</td>
      <td className="px-4 py-2 text-right">{formatKwh(consumption.jiramaKwh)}</td>
      <td className="px-4 py-2 text-right">{formatKwh(consumption.solarKwh)}</td>
      <td className="px-4 py-2 text-right">{formatKwh(consumption.generatorKwh)}</td>
      <td className="px-4 py-2">
        <div className="flex gap-2">
          <ButtonLink href={editHref} variant="secondary">
            Modifier<span className="sr-only"> {target}</span>
          </ButtonLink>
          <ConfirmDelete
            triggerLabel="Supprimer"
            triggerAriaLabel={`Supprimer ${target}`}
            title="Supprimer cette saisie ?"
            description={`Les consommations de ${consumption.roomName} pour ${period} seront supprimées. Cette action est définitive.`}
            confirmLabel="Supprimer la saisie"
            action={deleteConsumptionAction.bind(null, consumption.id)}
          />
        </div>
      </td>
    </tr>
  );
}

// Same rough shape as the table (a header and a few rows), so the page does not jump.
function ListSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div aria-hidden className="flex flex-col gap-2">
        <div className="h-10 rounded-md bg-border" />
        <div className="h-14 rounded-md bg-border" />
        <div className="h-14 rounded-md bg-border" />
        <div className="h-14 rounded-md bg-border" />
      </div>
    </div>
  );
}
