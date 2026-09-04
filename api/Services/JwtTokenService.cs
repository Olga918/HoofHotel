using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HoofHotel.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace HoofHotel.Api.Services;

public class JwtTokenService(IConfiguration config)
{
    public string CreateToken(User user)
    {
        var key = config["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key is missing");
        var issuer = config["Jwt:Issuer"] ?? "HoofHotel";
        var audience = config["Jwt:Audience"] ?? "HoofHotelMobile";
        var days = int.TryParse(config["Jwt:ExpireDays"], out var d) ? d : 7;

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.DisplayName),
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(days),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
