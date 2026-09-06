using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using HoofHotel.Api.Data;
using HoofHotel.Api.Dtos;
using HoofHotel.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HoofHotel.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class BookingsController(AppDbContext db) : ControllerBase
{
    /// <summary>Создать бронь. Нужен JWT: Authorization: Bearer ...</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest request, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Увійди в акаунт" });

        if (request.Guests < 1 || request.Guests > 20)
            return BadRequest(new { message = "Кількість гостей: від 1 до 20" });

        if (request.CheckOut <= request.CheckIn)
            return BadRequest(new { message = "Дата виїзду має бути пізніше заїзду" });

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (request.CheckIn < today)
            return BadRequest(new { message = "Дата заїзду не може бути в минулому" });

        var hotel = await db.Hotels.AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == request.HotelId, ct);
        if (hotel is null)
            return NotFound(new { message = "Готель не знайдено" });

        var nights = request.CheckOut.DayNumber - request.CheckIn.DayNumber;
        var total = hotel.PricePerNight * nights;

        var booking = new Booking
        {
            UserId = userId,
            HotelId = hotel.Id,
            CheckIn = request.CheckIn,
            CheckOut = request.CheckOut,
            Guests = request.Guests,
            TotalPrice = total,
            Status = BookingStatus.Confirmed,
            CreatedAt = DateTime.UtcNow
        };

        db.Bookings.Add(booking);
        await db.SaveChangesAsync(ct);

        return Ok(ToDto(booking, hotel));
    }

    /// <summary>Мои брони текущего пользователя.</summary>
    [HttpGet("mine")]
    public async Task<IActionResult> Mine(CancellationToken ct)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Увійди в акаунт" });

        var list = await db.Bookings.AsNoTracking()
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BookingDto(
                b.Id,
                b.HotelId,
                b.Hotel.Name,
                b.Hotel.City,
                b.Hotel.Country,
                b.CheckIn,
                b.CheckOut,
                b.Guests,
                b.TotalPrice,
                b.Status.ToString(),
                b.CreatedAt
            ))
            .ToListAsync(ct);

        return Ok(list);
    }

    /// <summary>Отменить свою бронь.</summary>
    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Увійди в акаунт" });

        var booking = await db.Bookings
            .Include(b => b.Hotel)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId, ct);

        if (booking is null)
            return NotFound(new { message = "Бронювання не знайдено" });

        if (booking.Status == BookingStatus.Cancelled)
            return BadRequest(new { message = "Вже скасовано" });

        booking.Status = BookingStatus.Cancelled;
        await db.SaveChangesAsync(ct);

        return Ok(ToDto(booking, booking.Hotel));
    }

    private bool TryGetUserId(out int userId)
    {
        userId = 0;
        var raw =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        return int.TryParse(raw, out userId);
    }

    private static BookingDto ToDto(Booking b, Hotel hotel) => new(
        b.Id,
        b.HotelId,
        hotel.Name,
        hotel.City,
        hotel.Country,
        b.CheckIn,
        b.CheckOut,
        b.Guests,
        b.TotalPrice,
        b.Status.ToString(),
        b.CreatedAt
    );
}
