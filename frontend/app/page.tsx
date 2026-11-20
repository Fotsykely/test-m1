import { Suspense } from "react";
import { connection } from "next/server";
import { listRooms } from "@/lib/api-client/rooms";
import { RoomPicker } from "./_components/room-picker";

export default function HomePage() {
  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold">Saisie de la consommation</h1>
      <p className="mb-6 text-muted-foreground">
        Choisissez le mois et l&apos;année, puis la salle dont vous voulez saisir la consommation.
      </p>
      {/* The API is read below, so it sits in its own <Suspense> boundary (see "Pièges Next.js 16" in the README). */}
      <Suspense fallback={<RoomPickerSkeleton />}>
        <RoomList />
      </Suspense>
    </>
  );
}

async function RoomList() {
  const rooms = await listRooms();

  // The default period is the current month. The current time must be read at request time.
  await connection();
  const now = new Date();

  return <RoomPicker rooms={rooms} defaultMonth={now.getMonth() + 1} defaultYear={now.getFullYear()} />;
}

// Same shape as the loaded content (two fields, then the table), so the page does not jump.
function RoomPickerSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Chargement des salles…</span>
      <div aria-hidden className="flex gap-4">
        <div className="h-[4.5rem] w-48 rounded-md bg-border" />
        <div className="h-[4.5rem] w-36 rounded-md bg-border" />
      </div>
      <div aria-hidden className="h-72 w-full max-w-md rounded-lg bg-border" />
    </div>
  );
}
