using HoofHotel.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HoofHotel.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Hotel> Hotels => Set<Hotel>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(200);
            e.Property(x => x.DisplayName).HasMaxLength(120);
        });

        modelBuilder.Entity<Hotel>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(160);
            e.Property(x => x.City).HasMaxLength(100);
            e.Property(x => x.Country).HasMaxLength(100);
            e.Property(x => x.PricePerNight).HasPrecision(10, 2);
            e.Property(x => x.Address).HasMaxLength(250);
        });

        modelBuilder.Entity<Booking>(e =>
        {
            e.Property(x => x.TotalPrice).HasPrecision(10, 2);
            e.HasOne(x => x.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Hotel)
                .WithMany(h => h.Bookings)
                .HasForeignKey(x => x.HotelId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Hotel>().HasData(HotelSeed.Items);
    }
}
