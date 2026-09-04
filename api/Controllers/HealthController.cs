using Microsoft.AspNetCore.Mvc;

namespace HoofHotel.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new
    {
        status = "ok",
        app = "HoofHotel API",
        slogan = "Найди ночлег. Без лишней скачки."
    });
}
