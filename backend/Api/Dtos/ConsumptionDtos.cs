using System.ComponentModel.DataAnnotations;
using Api.Entities;

namespace Api.Dtos;

// Request body for PUT: only the three kWh values can change. The room, year and month identify
// the entry and stay fixed, so an update can never collide with another entry.
public class ConsumptionValuesRequestDto
{
    private decimal? _jiramaKwh;
    private decimal? _solarKwh;
    private decimal? _generatorKwh;

    // How to change the kWh rules (nothing below is active, it is a reminder):
    //
    // The API validates, the form only shows its messages. Today: no negative value ([Range] starts at 0.0),
    // one maximum for the three energies (Consumption.KwhMax), and values rounded to 2 decimals
    // (RoundToStoredPrecision, matching HasPrecision(12, 2) in AppDbContext).
    //
    // - Allow negative values: lower the first bound of the three [Range] (for example -Consumption.KwhMax, or a
    //   new Consumption.KwhMin) and reword the three messages. Update the test that sends jiramaKwh = -1 and
    //   expects a 400 (ConsumptionsEndpointsTests). lib/kwh.ts in the front already accepts a "-".
    // - Refuse more than 2 decimals instead of rounding: remove RoundToStoredPrecision from the three setters and
    //   add a rule that rejects them (a [RegularExpression] or a custom attribute). The test expecting 10.13
    //   from 10.129 must change too.
    // - Whole numbers only: same rule in the API, plus /^-?\d+$/ in parseKwh (front) for faster feedback, and
    //   HasPrecision(12, 0) in AppDbContext, which needs a migration.
    // - More than 2 decimals: change HasPrecision (migration) and the 2 in Math.Round.
    // - A maximum per energy: replace KwhMax in Consumption.cs by JiramaKwhMax, SolarKwhMax and GeneratorKwhMax,
    //   use each one in its own [Range] (the {1} and {2} of the messages follow), grep KwhMax for other uses,
    //   and add one test per energy (a value just above the maximum gives a 400 on the right field).
    //
    // Changing only bounds needs no migration: the database is touched only when the precision changes.

    [Required(ErrorMessage = "La consommation Jirama est obligatoire.")]
    [Range(0.0, (double)Consumption.KwhMax,
        ErrorMessage = "La consommation Jirama doit être comprise entre {1} et {2} kWh.")]
    public decimal? JiramaKwh
    {
        get => _jiramaKwh;
        set => _jiramaKwh = RoundToStoredPrecision(value);
    }

    [Required(ErrorMessage = "La consommation solaire est obligatoire.")]
    [Range(0.0, (double)Consumption.KwhMax,
        ErrorMessage = "La consommation solaire doit être comprise entre {1} et {2} kWh.")]
    public decimal? SolarKwh
    {
        get => _solarKwh;
        set => _solarKwh = RoundToStoredPrecision(value);
    }

    [Required(ErrorMessage = "La consommation du groupe électrogène est obligatoire.")]
    [Range(0.0, (double)Consumption.KwhMax,
        ErrorMessage = "La consommation du groupe électrogène doit être comprise entre {1} et {2} kWh.")]
    public decimal? GeneratorKwh
    {
        get => _generatorKwh;
        set => _generatorKwh = RoundToStoredPrecision(value);
    }

    // The columns hold 2 decimals: rounding here makes the response match what is stored.
    private static decimal? RoundToStoredPrecision(decimal? value) =>
        value is null ? null : Math.Round(value.Value, 2, MidpointRounding.AwayFromZero);
}

// Request body for POST: the entry's identity (room, year, month) plus its values.
public class ConsumptionCreateRequestDto : ConsumptionValuesRequestDto
{
    [Required(ErrorMessage = "La salle est obligatoire.")]
    public int? RoomId { get; set; }

    [Required(ErrorMessage = "L'année est obligatoire.")]
    [Range(Consumption.YearMin, Consumption.YearMax,
        ErrorMessage = "L'année doit être comprise entre {1} et {2}.")]
    public int? Year { get; set; }

    [Required(ErrorMessage = "Le mois est obligatoire.")]
    [Range(Consumption.MonthMin, Consumption.MonthMax,
        ErrorMessage = "Le mois doit être compris entre {1} et {2}.")]
    public int? Month { get; set; }
}

// Response for a single entry, also used for the list.
public record ConsumptionDto(
    int Id,
    int RoomId,
    string RoomName,
    int Year,
    int Month,
    decimal JiramaKwh,
    decimal SolarKwh,
    decimal GeneratorKwh);

// One row of the result table: the kWh of a room summed over the requested period.
public record RoomSummaryDto(
    int RoomId,
    string RoomName,
    decimal JiramaKwh,
    decimal SolarKwh,
    decimal GeneratorKwh,
    decimal TotalKwh);

public record YearSummaryDto(
    int year,
    decimal JiramaKwh,
    decimal SolarKwh,
    decimal GeneratorKwh,
    decimal TotalKwh
);
