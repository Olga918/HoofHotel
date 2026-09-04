namespace HoofHotel.Api.Models;

public enum BookingStatus
{
    Pending = 0,
    Confirmed = 1,
    Cancelled = 2
}

public class Booking
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int HotelId { get; set; }
    public DateOnly CheckIn { get; set; }
    public DateOnly CheckOut { get; set; }
    public int Guests { get; set; } = 1;
    public decimal TotalPrice { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Hotel Hotel { get; set; } = null!;
}
