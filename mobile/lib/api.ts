import Constants from 'expo-constants';

/** Resolve API host: same machine as Expo Metro when possible. */
function resolveApiBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host && host !== '127.0.0.1' && host !== 'localhost') {
    return `http://${host}:5270`;
  }
  return 'http://127.0.0.1:5270';
}

export const API_BASE_URL = resolveApiBaseUrl();

export type AuthUser = {
  token: string;
  userId: number;
  email: string;
  displayName: string;
};

type AuthApiResponse = {
  token: string;
  userId: number;
  email: string;
  displayName: string;
  message?: string;
};

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string };
    if (data?.message) return data.message;
  } catch {
    // ignore
  }
  return `Помилка сервера (${res.status})`;
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as AuthApiResponse;
  return {
    token: data.token,
    userId: data.userId,
    email: data.email,
    displayName: data.displayName,
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as AuthApiResponse;
  return {
    token: data.token,
    userId: data.userId,
    email: data.email,
    displayName: data.displayName,
  };
}

export type Hotel = {
  id: number;
  name: string;
  city: string;
  country: string;
  description: string;
  pricePerNight: number;
  rating: number;
  imageUrl: string | null;
  address: string;
  maxGuests?: number;
  amenities?: string[];
  roomType?: string;
  roomSizeM2?: number;
  beds?: string;
  roomView?: string;
  bathroom?: string;
  latitude?: number;
  longitude?: number;
};

export type HotelDetail = Hotel & {
  amenities: string[];
  gallery: string[];
  reviewCount: number;
  reviewQuote: string | null;
  reviewAuthor: string | null;
  roomView?: string;
  floor?: number;
  bathroom?: string;
};

/** Absolute URL for hotel images (API wwwroot or external). */
export function resolveHotelImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${API_BASE_URL}${path}`;
}

/** GET /api/hotels — optional ?city= */
export async function fetchHotels(city?: string): Promise<Hotel[]> {
  const q = city?.trim() ? `?city=${encodeURIComponent(city.trim())}` : '';
  const res = await fetch(`${API_BASE_URL}/api/hotels${q}`);
  if (!res.ok) throw new Error(await readError(res));
  const list = (await res.json()) as Record<string, unknown>[];
  return list.map((raw) => {
    const h = raw as unknown as Hotel;
    const str = (a: string, b: string) => {
      const v = raw[a] ?? raw[b];
      return typeof v === 'string' && v.trim() ? v.trim() : undefined;
    };
    const num = (a: string, b: string) => {
      const v = raw[a] ?? raw[b];
      return typeof v === 'number' ? v : Number(v) || undefined;
    };
    return {
      ...h,
      imageUrl: resolveHotelImageUrl(h.imageUrl ?? (raw.ImageUrl as string | null)),
      amenities: (h.amenities ?? (raw.Amenities as string[]) ?? []) as string[],
      roomType: str('roomType', 'RoomType') ?? h.roomType,
      roomSizeM2: num('roomSizeM2', 'RoomSizeM2') ?? h.roomSizeM2,
      beds: str('beds', 'Beds') ?? h.beds,
      roomView: str('roomView', 'RoomView'),
      bathroom: str('bathroom', 'Bathroom'),
    };
  });
}

/** GET /api/hotels/{id} */
export async function fetchHotelById(id: number): Promise<HotelDetail> {
  const res = await fetch(`${API_BASE_URL}/api/hotels/${id}`);
  if (!res.ok) throw new Error(await readError(res));
  const raw = (await res.json()) as Record<string, unknown>;
  const str = (a: string, b?: string) => {
    const v = raw[a] ?? (b ? raw[b] : undefined);
    return typeof v === 'string' && v.trim() ? v.trim() : undefined;
  };
  const num = (a: string, b?: string) => {
    const v = raw[a] ?? (b ? raw[b] : undefined);
    return typeof v === 'number' ? v : Number(v) || undefined;
  };
  const h = raw as unknown as HotelDetail;
  return {
    ...h,
    imageUrl: resolveHotelImageUrl(h.imageUrl ?? (raw.ImageUrl as string | null)),
    gallery: ((h.gallery ?? (raw.Gallery as string[]) ?? []) as string[]).map(
      (u) => resolveHotelImageUrl(u) ?? u
    ),
    amenities: (h.amenities ?? (raw.Amenities as string[]) ?? []) as string[],
    roomType: str('roomType', 'RoomType') ?? h.roomType,
    roomSizeM2: num('roomSizeM2', 'RoomSizeM2') ?? h.roomSizeM2,
    beds: str('beds', 'Beds') ?? h.beds,
    roomView: str('roomView', 'RoomView') ?? h.roomView,
    floor: num('floor', 'Floor') ?? h.floor,
    bathroom: str('bathroom', 'Bathroom') ?? h.bathroom,
    latitude: num('latitude', 'Latitude') ?? h.latitude,
    longitude: num('longitude', 'Longitude') ?? h.longitude,
    reviewCount: num('reviewCount', 'ReviewCount') ?? h.reviewCount ?? 0,
    reviewQuote: str('reviewQuote', 'ReviewQuote') ?? h.reviewQuote ?? null,
    reviewAuthor: str('reviewAuthor', 'ReviewAuthor') ?? h.reviewAuthor ?? null,
  };
}

export type Booking = {
  id: number;
  hotelId: number;
  hotelName: string;
  city: string;
  country: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
};

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/** yyyy-MM-dd у локальному часі */
export function toDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function createBooking(
  token: string,
  input: { hotelId: number; checkIn: Date; checkOut: Date; guests: number }
): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      hotelId: input.hotelId,
      checkIn: toDateOnly(input.checkIn),
      checkOut: toDateOnly(input.checkOut),
      guests: input.guests,
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as Booking;
}

export async function fetchMyBookings(token: string): Promise<Booking[]> {
  const res = await fetch(`${API_BASE_URL}/api/bookings/mine`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as Booking[];
}

export async function cancelBooking(token: string, id: number): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/cancel`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as Booking;
}
