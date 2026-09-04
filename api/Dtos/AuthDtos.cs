namespace HoofHotel.Api.Dtos;

public record RegisterRequest(string Email, string Password, string DisplayName);

public record LoginRequest(string Email, string Password);

public record AuthResponse(
    string Token,
    int UserId,
    string Email,
    string DisplayName
);
