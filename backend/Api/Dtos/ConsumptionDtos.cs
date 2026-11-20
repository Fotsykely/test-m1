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
