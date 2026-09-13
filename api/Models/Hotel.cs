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

    /// <summary>Тип номера: Стандарт / Люкс / Апартаменти…</summary>
    public string RoomType { get; set; } = "Стандартний номер";

    /// <summary>Площа номера в м².</summary>
    public int RoomSizeM2 { get; set; } = 18;

    /// <summary>Опис ліжок: 1 двоспальне, 2 односпальні…</summary>
    public string Beds { get; set; } = "1 двоспальне ліжко";

    /// <summary>Вид з вікна.</summary>
    public string RoomView { get; set; } = "Вид на двір";

    /// <summary>Поверх (0 = не вказано).</summary>
    public int Floor { get; set; }

    /// <summary>Ванна / душ тощо.</summary>
    public string Bathroom { get; set; } = "Приватна ванна кімната";

    /// <summary>Широта для карти.</summary>
    public double Latitude { get; set; }

    /// <summary>Довгота для карти.</summary>
    public double Longitude { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
