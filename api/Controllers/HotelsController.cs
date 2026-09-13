using System.Text.Json;
using HoofHotel.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HoofHotel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelsController(AppDbContext db) : ControllerBase
{
    /// <summary>Список отелей. Опционально: ?city=Київ</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? city, CancellationToken ct)
    {
        var query = db.Hotels.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(city))
        {
            var term = city.Trim().ToLower();
            query = query.Where(h => h.City.ToLower().Contains(term));
        }

        var hotels = await query
            .OrderBy(h => h.City)
            .ThenBy(h => h.Name)
            .ToListAsync(ct);

        return Ok(hotels.Select(MapListItem));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var hotel = await db.Hotels.AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == id, ct);

        if (hotel is null) return NotFound(new { message = "Готель не знайдено" });
        return Ok(MapDetail(hotel));
    }

    private object MapListItem(Models.Hotel h) => new
    {
        h.Id,
        h.Name,
        h.City,
        h.Country,
        h.Description,
        h.PricePerNight,
        h.Rating,
        ImageUrl = Abs(h.ImageUrl),
        h.Address,
        h.MaxGuests,
        Amenities = h.Amenities
            .Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
        h.RoomType,
        h.RoomSizeM2,
        h.Beds,
        h.RoomView,
        h.Bathroom,
        h.Latitude,
        h.Longitude
    };

    private object MapDetail(Models.Hotel h)
    {
        var gallery = ParseGallery(h.GalleryJson);
        if (gallery.Count == 0 && !string.IsNullOrEmpty(h.ImageUrl))
            gallery.Add(h.ImageUrl);

        return new
        {
            h.Id,
            h.Name,
            h.City,
            h.Country,
            h.Description,
            h.PricePerNight,
            h.Rating,
            ImageUrl = Abs(h.ImageUrl),
            h.Address,
            h.MaxGuests,
            Amenities = h.Amenities
                .Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
            Gallery = gallery.Select(Abs).ToArray(),
            h.ReviewCount,
            h.ReviewQuote,
            h.ReviewAuthor,
            h.RoomType,
            h.RoomSizeM2,
            h.Beds,
            h.RoomView,
            h.Floor,
            h.Bathroom,
            h.Latitude,
            h.Longitude
        };
    }

    private static List<string> ParseGallery(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private string Abs(string? url)
    {
        if (string.IsNullOrEmpty(url)) return string.Empty;
        if (url.StartsWith("http", StringComparison.OrdinalIgnoreCase)) return url;
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        return baseUrl + (url.StartsWith('/') ? url : "/" + url);
    }
}
