using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Consumption> Consumptions => Set<Consumption>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Room>(room =>
        {
            room.Property(r => r.Name).HasMaxLength(Room.NameMaxLength);
            room.HasIndex(r => r.Name).IsUnique();

            // Reference data of the subject, inserted by the migration so that it exists in every environment.
            room.HasData(
                new Room { Id = 1, Name = "Amphi A" },
                new Room { Id = 2, Name = "Amphi B" },
                new Room { Id = 3, Name = "Salle 1" },
                new Room { Id = 4, Name = "Salle 2" },
                new Room { Id = 5, Name = "Labo" },
                new Room { Id = 6, Name = "Conférence" });
        });

        modelBuilder.Entity<Consumption>(consumption =>
        {
            consumption.Property(c => c.JiramaKwh).HasPrecision(12, 2);
            consumption.Property(c => c.SolarKwh).HasPrecision(12, 2);
            consumption.Property(c => c.GeneratorKwh).HasPrecision(12, 2);

            // A room cannot be deleted while it has consumption entries.
            consumption.HasOne(c => c.Room).WithMany().HasForeignKey(c => c.RoomId).OnDelete(DeleteBehavior.Restrict);

            // At most one entry per room and month: also what makes concurrent duplicate inserts fail.
            consumption.HasIndex(c => new { c.RoomId, c.Year, c.Month }).IsUnique();
        });
    }
}
