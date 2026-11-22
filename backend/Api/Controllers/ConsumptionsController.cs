using System.ComponentModel.DataAnnotations;
using Api.Data;
using Api.Dtos;
using Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace Api.Controllers;

[ApiController]
[Route("api/consumptions")]
public class ConsumptionsController(AppDbContext db) : ControllerBase
{
    // Every filter is optional: without any, all the entries are returned, newest period first.
    [HttpGet]
    public async Task<ActionResult<List<ConsumptionDto>>> GetAll(
        int? roomId,
        [Range(Consumption.YearMin, Consumption.YearMax, ErrorMessage = "L'année doit être comprise entre {1} et {2}.")]
        int? year,
        [Range(Consumption.MonthMin, Consumption.MonthMax, ErrorMessage = "Le mois doit être compris entre {1} et {2}.")]
        int? month,
        CancellationToken cancellationToken)
    {
        var query = FilterByPeriod(db.Consumptions.AsNoTracking(), year, month);
        if (roomId is not null)
            query = query.Where(c => c.RoomId == roomId);

        var consumptions = await query
            .Include(c => c.Room)
            .OrderByDescending(c => c.Year)
            .ThenByDescending(c => c.Month)
            .ThenBy(c => c.RoomId)
            .ToListAsync(cancellationToken);

        return consumptions.ConvertAll(ToDto);
    }

    // Result table: one row per room with its kWh summed over every month entered,
    // and zeros for a room that has no entry yet.
    [HttpGet("summary")]
    public async Task<ActionResult<List<RoomSummaryDto>>> GetSummary(
        [Range(Consumption.YearMin, Consumption.YearMax, ErrorMessage = "L'année doit être comprise entre {1} et {2}.")]
        int? year, 
        CancellationToken cancellationToken)
    {
        var query = FilterByPeriod(db.Consumptions.AsNoTracking(), year, null);

        var sumsByRoom = await query
            .GroupBy(c => c.RoomId)
            .Select(g => new
            {
                RoomId = g.Key,
                Jirama = g.Sum(c => c.JiramaKwh),
                Solar = g.Sum(c => c.SolarKwh),
                Generator = g.Sum(c => c.GeneratorKwh),
            })
            .ToDictionaryAsync(s => s.RoomId, cancellationToken);

        var rooms = await db.Rooms.AsNoTracking().OrderBy(r => r.Id).ToListAsync(cancellationToken);

        return rooms.ConvertAll(room => sumsByRoom.TryGetValue(room.Id, out var sums)
            ? new RoomSummaryDto(room.Id, room.Name, sums.Jirama, sums.Solar, sums.Generator,
                sums.Jirama + sums.Solar + sums.Generator)
            : new RoomSummaryDto(room.Id, room.Name, 0, 0, 0, 0));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ConsumptionDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var consumption = await db.Consumptions
            .AsNoTracking()
            .Include(c => c.Room)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        return consumption is null ? NotFound() : ToDto(consumption);
    }

    [HttpPost]
    public async Task<ActionResult<ConsumptionDto>> Create(
        ConsumptionCreateRequestDto request, CancellationToken cancellationToken)
    {
        var room = await db.Rooms.FindAsync([request.RoomId!.Value], cancellationToken);
        if (room is null)
        {
            ModelState.AddModelError(nameof(request.RoomId), "La salle est introuvable.");
            return ValidationProblem(ModelState);
        }

        var consumption = new Consumption
        {
            Room = room,
            Year = request.Year!.Value,
            Month = request.Month!.Value,
            JiramaKwh = request.JiramaKwh!.Value,
            SolarKwh = request.SolarKwh!.Value,
            GeneratorKwh = request.GeneratorKwh!.Value,
        };
        db.Consumptions.Add(consumption);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        // The unique index decides, so two simultaneous requests cannot both succeed.
        catch (DbUpdateException exception)
            when (exception.InnerException is MySqlException { ErrorCode: MySqlErrorCode.DuplicateKeyEntry })
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Saisie déjà existante",
                detail: "Une saisie existe déjà pour cette salle, ce mois et cette année : modifiez-la.");
        }

        return CreatedAtAction(nameof(GetById), new { id = consumption.Id }, ToDto(consumption));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ConsumptionDto>> Update(
        int id, ConsumptionValuesRequestDto request, CancellationToken cancellationToken)
    {
        var consumption = await db.Consumptions
            .Include(c => c.Room)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (consumption is null)
            return NotFound();

        consumption.JiramaKwh = request.JiramaKwh!.Value;
        consumption.SolarKwh = request.SolarKwh!.Value;
        consumption.GeneratorKwh = request.GeneratorKwh!.Value;
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(consumption);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deletedRows = await db.Consumptions.Where(c => c.Id == id).ExecuteDeleteAsync(cancellationToken);
        return deletedRows == 0 ? NotFound() : NoContent();
    }

    private static IQueryable<Consumption> FilterByPeriod(IQueryable<Consumption> query, int? year, int? month)
    {
        if (year is not null)
            query = query.Where(c => c.Year == year);
        if (month is not null)
            query = query.Where(c => c.Month == month);
        return query;
    }

    // The room must be loaded.
    private static ConsumptionDto ToDto(Consumption c) =>
        new(c.Id, c.RoomId, c.Room.Name, c.Year, c.Month, c.JiramaKwh, c.SolarKwh, c.GeneratorKwh);
}
