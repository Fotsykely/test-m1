import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { listRoomSummaries } from "@/lib/api-client/consumptions";
import { formatKwh } from "@/lib/format";

export const metadata: Metadata = { title: "Résultat par salle" };

// The heading renders at once; the API is read in a child inside its own <Suspense> (see the README,
// "Pièges Next.js 16").
export default function ResultsPage() {
  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold">Résultat</h1>
      <p className="mb-6 text-muted-foreground">
        Consommation totale de chaque salle, tous les mois saisis confondus.
      </p>
      <Suspense fallback={<ResultsSkeleton />}>
        <ResultsTable />
      </Suspense>
    </>
  );
}

// Every room has a row, with zeros when nothing has been entered for it yet.
async function ResultsTable() {
  const summaries = await listRoomSummaries();

  return (
    <div className="relative overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
      <table className="w-full min-w-[36rem] text-left">
        <caption className="sr-only">Consommation totale en kWh par salle et par type d&apos;énergie</caption>
        <thead className="border-b border-border bg-background text-sm text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2 font-semibold">Salle</th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">Jirama (kWh)</th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">Solaire (kWh)</th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">Groupe électrogène (kWh)</th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">Total (kWh)</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((summary) => (
            <tr key={summary.roomId} className="border-t border-border first:border-t-0">
              <th scope="row" className="px-4 py-2 font-medium">{summary.roomName}</th>
              <td className="px-4 py-2 text-right">{formatKwh(summary.jiramaKwh)}</td>
              <td className="px-4 py-2 text-right">{formatKwh(summary.solarKwh)}</td>
              <td className="px-4 py-2 text-right">{formatKwh(summary.generatorKwh)}</td>
              <td className="px-4 py-2 text-right font-semibold">
                <Link href={`/results/${summary.roomId}`} className="text-primary underline">
                  {formatKwh(summary.totalKwh)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Same rough shape as the table (a header and six rows), so the page does not jump.
function ResultsSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div aria-hidden className="flex flex-col gap-2">
        <div className="h-10 rounded-md bg-border" />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-11 rounded-md bg-border" />
        ))}
      </div>
    </div>
  );
}
