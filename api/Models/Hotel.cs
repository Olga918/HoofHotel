namespace HoofHotel.Api.Models;

public class Hotel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public double Rating { get; set; }
    public string? ImageUrl { get; set; }
    public string Address { get; set; } = string.Empty;

    /// <summary>Максимум гостей у номері (як у Booking).</summary>
    public int MaxGuests { get; set; } = 2;

    /// <summary>Зручності через | наприклад: Wi‑Fi|Сніданок|Парковка</summary>
    public string Amenities { get; set; } = string.Empty;

    /// <summary>JSON-масив шляхів до фото галереї.</summary>
    public string GalleryJson { get; set; } = "[]";

    public int ReviewCount { get; set; }

    public string? ReviewQuote { get; set; }

    public string? ReviewAuthor { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
