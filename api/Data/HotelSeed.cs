using HoofHotel.Api.Models;

namespace HoofHotel.Api.Data;

/// <summary>
/// Seed: у каждого отеля свой уникальный набор фото (без пересечений).
/// </summary>
public static class HotelSeed
{
    public static Hotel[] Items { get; } =
    [
        H(1, "Stable Inn", "Київ", "Україна",
            "Реєстрація 24/7. На стійці часто стоїть поні в бейджику «Адміністратор».",
            1890, 4.6, "вул. Хрещатик 12", 3,
            "Wi‑Fi|Ресепшн 24/7|Сейф для сідел|Сніданок",
            "hotel-pony-reception.png",
            ["hotel-pony-reception.png", "h1-keys.png", "h1-suite.png"],
            128, "Поні на рецепції видав ключі швидше за будь-якого адміністратора!", "Оля з Києва"),

        H(2, "Pony Plaza", "Львів", "Україна",
            "У галереї номерів — поні, що «тестує» м’якість матраца.",
            1450, 4.4, "пл. Ринок 3", 2,
            "Wi‑Fi|Центр міста|М’які подушки|Кава",
            "hotel-pony-bed.png",
            ["hotel-pony-bed.png", "h2-bounce.png", "h2-coffee.png"],
            86, "Матрац перевірений копитами. Спимо як ніколи.", "Марко, Львів"),

        H(3, "Neigh Neighbourhood", "Одеса", "Україна",
            "Сусіди дружні. Іржати до 22:00. Кінь біля ресепшн чекає ключі від люксу.",
            1620, 4.3, "Дерибасівська 8", 4,
            "Wi‑Fi|Море поруч|Сніданок|Сімейні номери",
            "hotel-horse-seaside.png",
            ["hotel-horse-seaside.png", "h3-beach.png", "h3-rooftop.png"],
            201, "Іржали до 21:59 — ідеально. Персонал з гумором.", "Катя, Одеса"),

        H(4, "Horseshoe Suites", "Харків", "Україна",
            "Удача на кожному поверсі. У люксі інколи знаходять плюшеве копито на подушці.",
            1380, 4.2, "Сумська 45", 2,
            "Wi‑Fi|Люкс|Ванна|Парковка",
            "hotel-pony-suite-door.png",
            ["hotel-pony-suite-door.png", "h4-lucky.png", "h4-bath.png"],
            64, "Знайшли копито на подушці — залишили на щастя.", "Ігор"),

        H(5, "Mane Attraction", "Дніпро", "Україна",
            "Головна атракція — грива у ванній. На фото кінь ніби обирає халат.",
            1710, 4.5, "Набережна Перемоги 1", 3,
            "Wi‑Fi|Спа-зона|Халати|Вид на річку",
            "hotel-horse-bathrobe.png",
            ["hotel-horse-bathrobe.png", "h5-spa.png", "h5-river.png"],
            97, "Халат XXL навіть для гриви. 10/10.", "Настя"),

        H(6, "Saddle & Stay", "Warszawa", "Polska",
            "Здав сідло на ресепшн — відпочивай. Багаж носить стажер-поні.",
            2100, 4.7, "Nowy Świat 22", 2,
            "Wi‑Fi|Багаж|Сніданок|Центр",
            "hotel-pony-bellhop.png",
            ["hotel-pony-bellhop.png", "h6-luggage.png", "h6-saddle.png"],
            155, "Поні-носій не загубив жодної сумки.", "Piotr"),

        H(7, "Gallop Guest House", "Kraków", "Polska",
            "До центру — легкий галоп. У дворі кінь ніби чекає таксі.",
            1980, 4.5, "Floriańska 10", 3,
            "Wi‑Fi|Старий город|Сніданок|Екскурсії",
            "hotel-horse-oldtown.png",
            ["hotel-horse-oldtown.png", "h7-taxi.png", "h7-map.png"],
            112, "До Вавеля — справді легкий галоп.", "Anna"),

        H(8, "Hayday Hotel", "Berlin", "Deutschland",
            "Сніданок включено: свіже сіно на сніданок і м’яка солома на ночліг.",
            2350, 4.4, "Unter den Linden 5", 2,
            "Сніданок включено|Wi‑Fi|Міні-бар|Солома premium",
            "hotel-horse-breakfast.png",
            ["hotel-horse-breakfast.png", "h8-buffet.png", "h8-straw.png"],
            240, "Кінь за столом снідав разом із нами. Незрівнянно!", "Lena, Berlin"),

        H(9, "Cobblestone Lodge", "Praha", "Česko",
            "Комфорт усередині. На ліжку інколи дрімає поні-інспектор чистоти.",
            2200, 4.6, "Karlova 7", 2,
            "Wi‑Fi|Історичний центр|Тихі номери|Сніданок",
            "hotel-pony-inspector.png",
            ["hotel-pony-inspector.png", "h9-sheets.png", "h9-nap.png"],
            178, "Інспектор-поні схвалив чистоту копитом.", "Tomáš"),

        H(10, "Quiet Hoof Hostel", "Wien", "Österreich",
            "Тихіше води, нижче копита. Quiet hours — навіть коні шепотом.",
            1550, 4.1, "Mariahilfer Str. 40", 6,
            "Wi‑Fi|Хостел|Кухня|Тиха година",
            "hotel-pony-quiet.png",
            ["hotel-pony-quiet.png", "h10-bunk.png", "h10-kitchen.png"],
            53, "Справді тихо. Коні шепочуть рецепти штруделя.", "Mia")
    ];

    private static Hotel H(
        int id,
        string name,
        string city,
        string country,
        string description,
        decimal price,
        double rating,
        string address,
        int maxGuests,
        string amenities,
        string coverFile,
        string[] galleryFiles,
        int reviewCount,
        string reviewQuote,
        string reviewAuthor) => new()
    {
        Id = id,
        Name = name,
        City = city,
        Country = country,
        Description = description,
        PricePerNight = price,
        Rating = rating,
        Address = address,
        MaxGuests = maxGuests,
        Amenities = amenities,
        ImageUrl = $"/hotels/{coverFile}",
        GalleryJson = System.Text.Json.JsonSerializer.Serialize(
            galleryFiles.Select(f => $"/hotels/{f}").ToArray()),
        ReviewCount = reviewCount,
        ReviewQuote = reviewQuote,
        ReviewAuthor = reviewAuthor
    };
}
