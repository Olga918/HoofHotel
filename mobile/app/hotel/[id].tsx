import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/Themed';
import { createBooking, fetchHotelById, type HotelDetail } from '@/lib/api';
import { hotelGallerySources, hotelImageSource } from '@/lib/hotelImages';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { estimateStayPrice, formatUaDate, useSearch } from '@/context/SearchContext';
import { useFavorites } from '@/context/FavoritesContext';

const { width: SCREEN_W } = Dimensions.get('window');
const PHOTO_H = 240;

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hotelId = Number(id);
  const router = useRouter();
  const { user } = useAuth();
  const search = useSearch();
  const favs = useFavorites();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const load = useCallback(async () => {
    if (!Number.isFinite(hotelId)) {
      setError('Невірний готель');
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      setHotel(await fetchHotelById(hotelId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося завантажити');
      setHotel(null);
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    load();
  }, [load]);

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setPhotoIndex(Math.round(x / SCREEN_W));
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Готель' }} />
        <ActivityIndicator color={colors.tint} size="large" />
      </View>
    );
  }

  if (error || !hotel) {
    return (
      <View style={[styles.center, styles.pad, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Готель' }} />
        <Text style={styles.error}>{error ?? 'Не знайдено'}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.tint, fontWeight: '700' }}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  const gallery = hotelGallerySources(hotel.gallery);
  const photos =
    gallery.length > 0
      ? gallery
      : hotelImageSource(hotel.imageUrl)
        ? [hotelImageSource(hotel.imageUrl)!]
        : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: hotel.name, headerBackTitle: 'Назад' }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        {photos.length > 0 ? (
          <View>
            <FlatList
              data={photos}
              keyExtractor={(_, i) => String(i)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onGalleryScroll}
              renderItem={({ item }) => (
                <Image source={item} style={{ width: SCREEN_W, height: PHOTO_H }} resizeMode="cover" />
              )}
            />
            <View style={styles.dots}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === photoIndex ? colors.tint : '#ccc' },
                  ]}
                />
              ))}
            </View>
            <RNText style={styles.photoCounter}>
              {photoIndex + 1} / {photos.length}
            </RNText>
          </View>
        ) : (
          <View style={[styles.photoFallback, { backgroundColor: '#e8ddd2' }]}>
            <RNText style={{ fontSize: 48 }}>🐴</RNText>
          </View>
        )}

        <View style={styles.pad}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text, flex: 1 }]}>{hotel.name}</Text>
            <Pressable
              onPress={() => favs.toggleFavorite(hotel.id)}
              hitSlop={10}
              style={styles.favBtn}
            >
              <RNText style={{ fontSize: 26, color: '#c0392b' }}>
                {favs.isFavorite(hotel.id) ? '♥' : '♡'}
              </RNText>
            </Pressable>
          </View>
          <Text style={[styles.meta, { color: colors.tabIconDefault }]}>
            ★ {hotel.rating.toFixed(1)} · {hotel.reviewCount} відгуків
          </Text>
          <Text style={[styles.place, { color: colors.text }]}>
            📍 {hotel.address}
          </Text>
          <Text style={[styles.place, { color: colors.tabIconDefault }]}>
            {hotel.city}, {hotel.country}
          </Text>

          <View style={[styles.chipRow]}>
            <View style={[styles.infoChip, { backgroundColor: '#e8ddd2' }]}>
              <RNText style={styles.infoChipText}>👥 до {hotel.maxGuests ?? 2} гостей</RNText>
            </View>
            <View style={[styles.infoChip, { backgroundColor: '#e8ddd2' }]}>
              <RNText style={styles.infoChipText}>
                💰 {Math.round(hotel.pricePerNight)} грн / ніч / особа
              </RNText>
            </View>
          </View>

          <View style={[styles.reviewCard, { borderColor: colors.tabIconDefault, marginTop: 14 }]}>
            <Text style={[styles.meta, { color: colors.tabIconDefault }]}>
              {formatUaDate(search.checkIn)} → {formatUaDate(search.checkOut)} · {search.guests}{' '}
              ос. · {search.nights}{' '}
              {search.nights === 1 ? 'ніч' : 'ночей'}
            </Text>
            <Text style={[styles.title, { color: colors.tint, fontSize: 20, marginTop: 6 }]}>
              Разом ~ {estimateStayPrice(hotel.pricePerNight, search.guests, search.nights)} грн
            </Text>
            {(hotel.maxGuests ?? 2) < search.guests ? (
              <Text style={{ color: '#c0392b', marginTop: 6 }}>
                У цьому номері максимум {hotel.maxGuests} гостей — оберіть менше людей у пошуку.
              </Text>
            ) : (
              <Text style={{ color: '#2e7d32', marginTop: 6 }}>Є місця під ваш запит</Text>
            )}
          </View>

          <Text style={[styles.section, { color: colors.text }]}>Опис</Text>
          <Text style={[styles.body, { color: colors.text }]}>{hotel.description}</Text>

          {hotel.amenities?.length ? (
            <>
              <Text style={[styles.section, { color: colors.text }]}>Зручності</Text>
              <View style={styles.amenities}>
                {hotel.amenities.map((a) => (
                  <View key={a} style={[styles.amenity, { borderColor: colors.tabIconDefault }]}>
                    <RNText style={{ color: colors.text, fontSize: 13 }}>✓ {a}</RNText>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {hotel.reviewQuote ? (
            <>
              <Text style={[styles.section, { color: colors.text }]}>Відгук гостя</Text>
              <View style={[styles.reviewCard, { borderColor: colors.tabIconDefault }]}>
                <Text style={[styles.body, { color: colors.text }]}>«{hotel.reviewQuote}»</Text>
                <Text style={[styles.meta, { color: colors.tabIconDefault, marginTop: 8 }]}>
                  — {hotel.reviewAuthor ?? 'гість'} · ★ {hotel.rating.toFixed(1)}
                </Text>
              </View>
            </>
          ) : null}

          <Pressable
            style={[
              styles.bookBtn,
              {
                backgroundColor: colors.tint,
                opacity: bookingBusy ? 0.6 : 1,
              },
            ]}
            disabled={bookingBusy}
            onPress={async () => {
              if (!user) {
                router.push('/(tabs)/profile');
                return;
              }
              if (!hotel) return;
              if ((hotel.maxGuests ?? 2) < search.guests) {
                Alert.alert(
                  'Немає місць',
                  `У номері максимум ${hotel.maxGuests} гостей. Зменши кількість людей у пошуку.`
                );
                return;
              }
              setBookingBusy(true);
              try {
                const b = await createBooking(user.token, {
                  hotelId: hotel.id,
                  checkIn: search.checkIn,
                  checkOut: search.checkOut,
                  guests: search.guests,
                });
                Alert.alert(
                  'Заброньовано! 🐴',
                  `${b.hotelName}\n${b.checkIn} → ${b.checkOut}\n${b.guests} ос. · ${Math.round(Number(b.totalPrice))} грн\n\nКлючі видає поні на рецепції.`,
                  [
                    { text: 'Мої броні', onPress: () => router.push('/(tabs)/bookings') },
                    { text: 'Ок' },
                  ]
                );
              } catch (e) {
                Alert.alert(
                  'Не вдалося',
                  e instanceof Error ? e.message : 'Помилка бронювання'
                );
              } finally {
                setBookingBusy(false);
              }
            }}
          >
            {bookingBusy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <RNText style={styles.bookBtnText}>
                {user ? 'Забронювати' : 'Увійти, щоб забронювати'}
              </RNText>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pad: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  favBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  meta: { fontSize: 14, marginBottom: 6 },
  place: { fontSize: 15, marginBottom: 4, lineHeight: 22 },
  section: { fontSize: 18, fontWeight: '800', marginTop: 18, marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  infoChip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  infoChipText: { fontWeight: '700', color: '#2b1d14', fontSize: 13 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenity: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
  },
  bookBtn: {
    marginTop: 22,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  photoCounter: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 12,
    color: '#888',
  },
  photoFallback: {
    height: PHOTO_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { color: '#c0392b', marginBottom: 12, textAlign: 'center' },
});
