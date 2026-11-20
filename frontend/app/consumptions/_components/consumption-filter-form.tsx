import Form from "next/form";
import { Button, ButtonLink } from "@/components/button";
import { InputField, SelectField } from "@/components/field";
import type { ConsumptionFilter, Room } from "@/lib/api-client/types";
import { hasFilter } from "@/lib/consumption-filter";
import { MONTHS, YEAR_MAX, YEAR_MIN } from "@/lib/period";

type ConsumptionFilterFormProps = {
  rooms: Room[];
  filter: ConsumptionFilter;
};

// A GET form: the criteria go to the URL (/consumptions?roomId=5&month=6&year=2026), so a filtered list can
// be shared, reloaded and reached with the browser's back button. An empty field means "no criterion".
export function ConsumptionFilterForm({ rooms, filter }: ConsumptionFilterFormProps) {
  return (
    <Form action="/consumptions" className="mb-6 flex flex-wrap items-end gap-4">
      <div className="w-48">
        <SelectField label="Salle" name="roomId" defaultValue={filter.roomId ?? ""}>
          <option value="">Toutes les salles</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="w-48">
        <SelectField label="Mois" name="month" defaultValue={filter.month ?? ""}>
          <option value="">Tous les mois</option>
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
          placeholder="Toutes"
          defaultValue={filter.year ?? ""}
        />
      </div>
      <Button type="submit">Filtrer</Button>
      {hasFilter(filter) && (
        <ButtonLink href="/consumptions" variant="secondary">
          Réinitialiser
        </ButtonLink>
      )}
    </Form>
  );
}
