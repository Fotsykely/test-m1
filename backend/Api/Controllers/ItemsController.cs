using Api.Data;
using Api.Dtos;
using Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/items")]
public class ItemsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ItemDto>>> GetAll(CancellationToken cancellationToken)
    {
        return await db.Items
            .OrderByDescending(i => i.CreatedAt)
            .ThenByDescending(i => i.Id)
            .Select(i => new ItemDto(i.Id, i.Name, i.Description, i.Status, i.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ItemDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await db.Items.FindAsync([id], cancellationToken);
        return item is null ? NotFound() : ToDto(item);
    }

    [HttpPost]
    public async Task<ActionResult<ItemDto>> Create(ItemRequestDto request, CancellationToken cancellationToken)
    {
        var item = new Item { Name = request.Name!, Description = request.Description, Status = request.Status };
        db.Items.Add(item);
        await db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ToDto(item));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ItemDto>> Update(int id, ItemRequestDto request, CancellationToken cancellationToken)
    {
        var item = await db.Items.FindAsync([id], cancellationToken);
        if (item is null)
            return NotFound();

        item.Name = request.Name!;
        item.Description = request.Description;
        item.Status = request.Status;
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deletedRows = await db.Items.Where(i => i.Id == id).ExecuteDeleteAsync(cancellationToken);
        return deletedRows == 0 ? NotFound() : NoContent();
    }

    private static ItemDto ToDto(Item item) =>
        new(item.Id, item.Name, item.Description, item.Status, item.CreatedAt);
}
