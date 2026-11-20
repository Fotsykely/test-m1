namespace Api.Entities;

// Energy consumption (in kWh) of one room for one month. There is one row per room, year and month,
// with one column per energy type: the three types are fixed by the subject.
public class Consumption
{
    // These limits are shared by the database schema and the request validation.
    public const int YearMin = 2000;
    public const int YearMax = 2100;
    public const int MonthMin = 1;
    public const int MonthMax = 12;
    public const int KwhMax = 100_000_000;

    public int Id { get; set; }
    public int RoomId { get; set; }
    public required Room Room { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal JiramaKwh { get; set; }
    public decimal SolarKwh { get; set; }
    public decimal GeneratorKwh { get; set; }
}
