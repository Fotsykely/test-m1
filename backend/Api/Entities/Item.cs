namespace Api.Entities;

// Sample entity of the template: rename it or delete it (see the README, "Add an entity").
public class Item
{
    // These limits are shared by the database schema and the request validation.
    public const int NameMinLength = 3;
    public const int NameMaxLength = 100;
    public const int DescriptionMaxLength = 500;

    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public ItemStatus Status { get; set; }

    // Filled in by the database (CURRENT_TIMESTAMP(6)) on insert: see AppDbContext.
    public DateTime CreatedAt { get; set; }
}
