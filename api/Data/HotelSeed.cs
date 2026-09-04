using HoofHotel.Api.Models;

namespace HoofHotel.Api.Data;

public static class HotelSeed
{
    public static Hotel[] Items { get; } =
    [
        new()
        {
            Id = 1,
            Name = "Stable Inn",
            City = "Київ",
            Country = "Україна",
            Description = "Тихо, майже як у конюшні класу люкс.",
            PricePerNight = 1890,
            Rating = 4.6,
            Address = "вул. Хрещатик 12",
            ImageUrl = null
        },
        new()
        {
            Id = 2,
            Name = "Pony Plaza",
            City = "Львів",
            Country = "Україна",
            Description = "Маленький, але гордий.",
            PricePerNight = 1450,
            Rating = 4.4,
            Address = "пл. Ринок 3",
            ImageUrl = null
        },
        new()
        {
            Id = 3,
            Name = "Neigh Neighbourhood",
            City = "Одеса",
            Country = "Україна",
            Description = "Сусіди дружні. Іржати можна до 22:00.",
            PricePerNight = 1620,
            Rating = 4.3,
            Address = "Дерибасівська 8",
            ImageUrl = null
        },
        new()
        {
            Id = 4,
            Name = "Horseshoe Suites",
            City = "Харків",
            Country = "Україна",
            Description = "Удача на кожному поверсі.",
            PricePerNight = 1380,
            Rating = 4.2,
            Address = "Сумська 45",
            ImageUrl = null
        },
        new()
        {
            Id = 5,
            Name = "Mane Attraction",
            City = "Дніпро",
            Country = "Україна",
            Description = "Головне — вид з вікна.",
            PricePerNight = 1710,
            Rating = 4.5,
            Address = "Набережна Перемоги 1",
            ImageUrl = null
        },
        new()
        {
            Id = 6,
            Name = "Saddle & Stay",
            City = "Warszawa",
            Country = "Polska",
            Description = "Сумки здав — відпочивай.",
            PricePerNight = 2100,
            Rating = 4.7,
            Address = "Nowy Świat 22",
            ImageUrl = null
        },
        new()
        {
            Id = 7,
            Name = "Gallop Guest House",
            City = "Kraków",
            Country = "Polska",
            Description = "До центру — легкий галоп.",
            PricePerNight = 1980,
            Rating = 4.5,
            Address = "Floriańska 10",
            ImageUrl = null
        },
        new()
        {
            Id = 8,
            Name = "Hayday Hotel",
            City = "Berlin",
            Country = "Deutschland",
            Description = "Сніданок включено (сіно — жарт).",
            PricePerNight = 2350,
            Rating = 4.4,
            Address = "Unter den Linden 5",
            ImageUrl = null
        },
        new()
        {
            Id = 9,
            Name = "Cobblestone Lodge",
            City = "Praha",
            Country = "Česko",
            Description = "Камені у дворі, комфорт усередині.",
            PricePerNight = 2200,
            Rating = 4.6,
            Address = "Karlova 7",
            ImageUrl = null
        },
        new()
        {
            Id = 10,
            Name = "Quiet Hoof Hostel",
            City = "Wien",
            Country = "Österreich",
            Description = "Тихіше води, нижче копита.",
            PricePerNight = 1550,
            Rating = 4.1,
            Address = "Mariahilfer Str. 40",
            ImageUrl = null
        }
    ];
}
