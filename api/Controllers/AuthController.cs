using HoofHotel.Api.Data;
using HoofHotel.Api.Dtos;
using HoofHotel.Api.Models;
using HoofHotel.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HoofHotel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, JwtTokenService jwt) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var email = request.Email?.Trim().ToLowerInvariant() ?? "";
        var displayName = request.DisplayName?.Trim() ?? "";
        var password = request.Password ?? "";

        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return BadRequest(new { message = "Вкажи коректний email" });

        if (displayName.Length < 2)
            return BadRequest(new { message = "Ім'я має бути щонайменше 2 символи" });

        if (password.Length < 6)
            return BadRequest(new { message = "Пароль має бути щонайменше 6 символів" });

        var exists = await db.Users.AnyAsync(u => u.Email == email, ct);
        if (exists)
            return Conflict(new { message = "Користувач з таким email вже існує" });

        var user = new User
        {
            Email = email,
            DisplayName = displayName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        var token = jwt.CreateToken(user);
        return Ok(new AuthResponse(token, user.Id, user.Email, user.DisplayName));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var email = request.Email?.Trim().ToLowerInvariant() ?? "";
        var password = request.Password ?? "";

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return BadRequest(new { message = "Вкажи email і пароль" });

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return Unauthorized(new { message = "Невірний email або пароль" });

        var token = jwt.CreateToken(user);
        return Ok(new AuthResponse(token, user.Id, user.Email, user.DisplayName));
    }
}
