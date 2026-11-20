using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public static class DemoDataSeeder
{
    // Inserts nothing when the database already has items: restarting the API never creates duplicates.
    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.Items.AnyAsync(cancellationToken))
            return;

        db.Items.AddRange(
            new Item { Name = "Premier élément", Description = "Un élément de démonstration.", Status = ItemStatus.Active },
            new Item { Name = "Brouillon en cours", Status = ItemStatus.Draft },
            new Item { Name = "Ancien élément", Description = "Archivé, plus utilisé.", Status = ItemStatus.Archived });

        await db.SaveChangesAsync(cancellationToken);
    }
}
