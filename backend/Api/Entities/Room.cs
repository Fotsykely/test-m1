namespace Api.Entities;

// A room of the campus (Amphi A, Labo...). The list is fixed by the subject and seeded by a migration.
public class Room
{
    public const int NameMaxLength = 100;

    public int Id { get; set; }
    public required string Name { get; set; }
}
