using Api.Data;
using Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

// Rooms are reference data: read-only.
[ApiController]
[Route("api/rooms")]
public class RoomsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<RoomDto>>> GetAll(CancellationToken cancellationToken)
    {
        return await db.Rooms
            .OrderBy(r => r.Id)
            .Select(r => new RoomDto(r.Id, r.Name))
            .ToListAsync(cancellationToken);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoomDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var room = await db.Rooms.FindAsync([id], cancellationToken);
        return room is null ? NotFound() : new RoomDto(room.Id, room.Name);
    }
}
