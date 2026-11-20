import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { findConsumption } from "@/lib/api-client/consumptions";
import { getRoom } from "@/lib/api-client/rooms";
import { monthName, parseMonth, parseYear } from "@/lib/period";
import { orNotFound, parseRouteId } from "@/lib/route-helpers";
import { ConsumptionForm } from "./_components/consumption-form";
import { saveConsumptionAction } from "./actions";

export const metadata: Metadata = { title: "Saisir la consommation" };

type EntryPageProps = PageProps<"/consumptions/entry">;

// The page itself renders instantly (static heading). Reading `searchParams` and calling the API happen in a
// child inside its own <Suspense>: with Cache Components, a boundary above the shared layout (the root
// loading.tsx) does not give an instant fallback on a client navigation to this route.
export default function EntryPage(props: EntryPageProps) {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Saisir la consommation</h1>
      <Suspense fallback={<EntrySkeleton />}>
        <EntryContent searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

// The room and the period come from the link of the room list. A link that was edited by hand
// (unknown room, month 13...) leads to the "not found" page.
async function EntryContent({ searchParams }: { searchParams: EntryPageProps["searchParams"] }) {
  const query = await searchParams;
  const roomId = parseRouteId(firstValue(query.roomId));
  const month = parseMonth(firstValue(query.month));
  const year = parseYear(firstValue(query.year));
  if (month === null || year === null) notFound();

  const [room, existing] = await Promise.all([
    orNotFound(getRoom(roomId)),
    findConsumption(roomId, month, year),
  ]);

  return (
    <>
      <dl className="mb-6 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-1">
        <dt className="text-muted-foreground">Salle</dt>
        <dd className="font-semibold">{room.name}</dd>
        <dt className="text-muted-foreground">Mois</dt>
        <dd className="font-semibold">{monthName(month)}</dd>
        <dt className="text-muted-foreground">Année</dt>
        <dd className="font-semibold">{year}</dd>
      </dl>

      {existing && (
        <p className="mb-6 max-w-md rounded-lg border border-border bg-primary-subtle p-3">
          Une saisie existe déjà pour cette salle et ce mois : les valeurs ci-dessous la remplaceront.
        </p>
      )}

      {/* The key gives each room and month its own form. Without it, moving to another month through the app
          reuses the same form: what was typed stays on screen (the inputs only take their default value
          once) and so does an error message. */}
      <ConsumptionForm
        key={`${roomId}-${year}-${month}`}
        action={saveConsumptionAction.bind(null, { roomId, month, year, consumptionId: existing?.id ?? null })}
        initialValues={{
          jiramaKwh: existing ? String(existing.jiramaKwh) : "",
          solarKwh: existing ? String(existing.solarKwh) : "",
          generatorKwh: existing ? String(existing.generatorKwh) : "",
        }}
        cancelHref="/"
      />
    </>
  );
}

// A query parameter is a string, a list when repeated, or missing.
function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// Same rough shape as the page (three lines, three fields and the buttons), so it does not jump.
function EntrySkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div aria-hidden className="flex max-w-md flex-col gap-5">
        <div className="h-16 rounded-md bg-border" />
        <div className="h-16 rounded-md bg-border" />
        <div className="h-16 rounded-md bg-border" />
        <div className="h-16 rounded-md bg-border" />
        <div className="h-11 w-40 rounded-md bg-border" />
      </div>
    </div>
  );
}
