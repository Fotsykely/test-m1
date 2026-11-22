import Form from "next/form";
import { Button, ButtonLink } from "@/components/button";
import { InputField } from "@/components/field";
import { YEAR_MAX, YEAR_MIN } from "@/lib/period";

type YearFilterFormProps = {
  year?: number
};

// A GET form: the criteria go to the URL (/results?year=2026), so a filtered list can
// be shared, reloaded and reached with the browser's back button. An empty field means "no criterion".
export function YearFilterForm({ year }: YearFilterFormProps) {
  return (
    <Form action="/results" className="mb-6 flex flex-wrap items-end gap-4">
      <div className="w-36">
        <InputField
          label="Année"
          name="year"
          type="number"
          inputMode="numeric"
          min={YEAR_MIN}
          max={YEAR_MAX}
          placeholder="Toutes"
          defaultValue={year ?? ""}
        />
      </div>
      <Button type="submit">Voir</Button>
      {year !== undefined && (
        <ButtonLink href="/results" variant="secondary">
          Réinitialiser
        </ButtonLink>
      )}
    </Form>
  );
}
