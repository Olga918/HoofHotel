namespace HoofHotel.Api.Dtos;

public record CreateBookingRequest(
    int HotelId,
    DateOnly CheckIn,
    DateOnly CheckOut,
    int Guests
);

public record BookingDto(
    int Id,
    int HotelId,
    string HotelName,
    string City,
    string Country,
    DateOnly CheckIn,
    DateOnly CheckOut,
    int Guests,
    decimal TotalPrice,
    string Status,
    DateTime CreatedAt
);
