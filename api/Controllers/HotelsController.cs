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
            .Select(h => new
            {
                h.Id,
                h.Name,
                h.City,
                h.Country,
                h.Description,
                h.PricePerNight,
                h.Rating,
                h.ImageUrl,
                h.Address
            })
            .ToListAsync(ct);

        return Ok(hotels);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var hotel = await db.Hotels.AsNoTracking()
            .Where(h => h.Id == id)
            .Select(h => new
            {
                h.Id,
                h.Name,
                h.City,
                h.Country,
                h.Description,
                h.PricePerNight,
                h.Rating,
                h.ImageUrl,
                h.Address
            })
            .FirstOrDefaultAsync(ct);

        if (hotel is null) return NotFound(new { message = "Готель не знайдено" });
        return Ok(hotel);
    }
}
