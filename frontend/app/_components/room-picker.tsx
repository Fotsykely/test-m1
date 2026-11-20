"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/button";
import { InputField, SelectField } from "@/components/field";
import type { Room } from "@/lib/api-client/types";
import { MONTHS, YEAR_MAX, YEAR_MIN, parseYear } from "@/lib/period";

type RoomPickerProps = {
  rooms: Room[];
  defaultMonth: number;
  defaultYear: number;
};

// The month and the year chosen here are carried by the "Saisir" link of each room to the entry form.
// Nothing is sent to the server until the user follows a link.
export function RoomPicker({ rooms, defaultMonth, defaultYear }: RoomPickerProps) {
  const [month, setMonth] = useState(String(defaultMonth));
  const [yearText, setYearText] = useState(String(defaultYear));
  const year = parseYear(yearText);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="w-48">
          <SelectField label="Mois" name="month" value={month} onChange={(event) => setMonth(event.target.value)}>
            {MONTHS.map(({ number, name }) => (
              <option key={number} value={number}>
                {name}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="w-36">
          <InputField
            label="Année"
            name="year"
            type="number"
            inputMode="numeric"
            min={YEAR_MIN}
            max={YEAR_MAX}
            value={yearText}
            onChange={(event) => setYearText(event.target.value)}
            errors={year === null ? [`L'année doit être comprise entre ${YEAR_MIN} et ${YEAR_MAX}.`] : undefined}
          />
        </div>
      </div>

      <table className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-surface text-left shadow-sm">
        <caption className="sr-only">Salles du campus</caption>
        <thead className="border-b border-border bg-background text-sm text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2 font-semibold">
              Salle
            </th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">
              Saisie
            </th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id} className="border-t border-border first:border-t-0">
              <th scope="row" className="px-4 py-2 font-medium">
                {room.name}
              </th>
              <td className="px-4 py-2 text-right">
                {year === null ? (
                  // Without a valid year there is no period to enter: the link would lead to an error.
                  <Button variant="secondary" disabled>
                    Saisir
                  </Button>
                ) : (
                  <ButtonLink
                    variant="secondary"
                    href={`/consumptions/new?roomId=${room.id}&month=${month}&year=${year}`}
                  >
                    Saisir<span className="sr-only"> pour {room.name}</span>
                  </ButtonLink>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
