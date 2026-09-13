using System.Text;
using HoofHotel.Api.Data;
using HoofHotel.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<JwtTokenService>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is missing in configuration");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ExpoDev", policy =>
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // Нові колонки для вже існуючої БД (PostgreSQL)
    db.Database.ExecuteSqlRaw(
        """
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "MaxGuests" integer NOT NULL DEFAULT 2;
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "Amenities" character varying(500) NOT NULL DEFAULT '';
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "GalleryJson" character varying(2000) NOT NULL DEFAULT '[]';
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "ReviewCount" integer NOT NULL DEFAULT 0;
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "ReviewQuote" character varying(500) NULL;
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "ReviewAuthor" character varying(120) NULL;
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "RoomType" character varying(120) NOT NULL DEFAULT 'Стандартний номер';
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "RoomSizeM2" integer NOT NULL DEFAULT 18;
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "Beds" character varying(200) NOT NULL DEFAULT '1 двоспальне ліжко';
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "RoomView" character varying(160) NOT NULL DEFAULT 'Вид на двір';
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "Floor" integer NOT NULL DEFAULT 0;
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "Bathroom" character varying(160) NOT NULL DEFAULT 'Приватна ванна кімната';
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "Latitude" double precision NOT NULL DEFAULT 0;
        ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "Longitude" double precision NOT NULL DEFAULT 0;
        """);

    foreach (var item in HotelSeed.Items)
    {
        var row = db.Hotels.Find(item.Id);
        if (row is null)
        {
            db.Hotels.Add(item);
            continue;
        }

        row.Name = item.Name;
        row.City = item.City;
        row.Country = item.Country;
        row.Description = item.Description;
        row.PricePerNight = item.PricePerNight;
        row.Rating = item.Rating;
        row.Address = item.Address;
        row.ImageUrl = item.ImageUrl;
        row.MaxGuests = item.MaxGuests;
        row.Amenities = item.Amenities;
        row.GalleryJson = item.GalleryJson;
        row.ReviewCount = item.ReviewCount;
        row.ReviewQuote = item.ReviewQuote;
        row.ReviewAuthor = item.ReviewAuthor;
        row.RoomType = item.RoomType;
        row.RoomSizeM2 = item.RoomSizeM2;
        row.Beds = item.Beds;
        row.RoomView = item.RoomView;
        row.Floor = item.Floor;
        row.Bathroom = item.Bathroom;
        row.Latitude = item.Latitude;
        row.Longitude = item.Longitude;
    }

    db.SaveChanges();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("ExpoDev");
app.UseStaticFiles();
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
