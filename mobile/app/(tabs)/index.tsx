import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '@/components/Themed';
import { fetchHotels, type Hotel } from '@/lib/api';
import { hotelImageSource } from '@/lib/hotelImages';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import {
  estimateStayPrice,
  formatUaDate,
  useSearch,
} from '@/context/SearchContext';
import { useFavorites } from '@/context/FavoritesContext';

type DateField = 'checkIn' | 'checkOut' | null;

const CITY_CHIPS = ['Київ', 'Львів', 'Одеса', 'Warszawa', 'Berlin', 'Praha'];

export default function SearchScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const router = useRouter();
  const search = useSearch();
  const favs = useFavorites();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateField, setDateField] = useState<DateField>(null);
  const [onlyFavs, setOnlyFavs] = useState(false);

  const load = useCallback(async (toCity?: string) => {
    setError(null);
    try {
      const list = await fetchHotels(toCity);
      setHotels(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося завантажити готелі');
      setHotels([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onSearch = async () => {
    setLoading(true);
    await load(search.toCity);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load(search.toCity);
    setRefreshing(false);
  };

  const visibleHotels = useMemo(() => {
    return hotels
      .map((h) => {
        const max = h.maxGuests ?? 2;
        const fits = search.guests <= max;
        const roomsNeeded = Math.ceil(search.guests / max);
        const total = estimateStayPrice(h.pricePerNight, search.guests, search.nights);
        return { hotel: h, fits, roomsNeeded, total, max };
      })
      .filter((x) => x.fits)
      .filter((x) => !onlyFavs || favs.isFavorite(x.hotel.id));
  }, [hotels, search.guests, search.nights, onlyFavs, favs]);

  const pickCity = async (city: string) => {
    search.setToCity(city);
    setLoading(true);
    await load(city);
    setLoading(false);
  };

  const onDateChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setDateField(null);
    if (!selected || !dateField) return;
    if (dateField === 'checkIn') search.setCheckIn(selected);
    else search.setCheckOut(selected);
  };

  const renderItem = ({
    item,
  }: {
    item: { hotel: Hotel; fits: boolean; roomsNeeded: number; total: number; max: number };
  }) => {
    const { hotel, roomsNeeded, total, max } = item;
    const photo = hotelImageSource(hotel.imageUrl);
    const liked = favs.isFavorite(hotel.id);
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/hotel/[id]',
            params: { id: String(hotel.id) },
          })
        }
        style={[
          styles.card,
          { borderColor: colors.tabIconDefault, backgroundColor: '#fff' },
        ]}
      >
        <View>
          {photo ? (
            <Image source={photo} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <RNText style={styles.photoPlaceholderText}>🐴</RNText>
            </View>
          )}
          <Pressable
            style={styles.heartBtn}
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation?.();
              favs.toggleFavorite(hotel.id);
            }}
          >
            <RNText style={styles.heartText}>{liked ? '♥' : '♡'}</RNText>
          </Pressable>
        </View>
        <View style={styles.cardTop}>
          <Text style={[styles.hotelName, { color: colors.text }]}>{hotel.name}</Text>
          <Text style={[styles.rating, { color: colors.tint }]}>★ {hotel.rating.toFixed(1)}</Text>
        </View>
        <Text style={[styles.place, { color: colors.tabIconDefault }]}>
          {hotel.city}, {hotel.country}
        </Text>
        <Text style={[styles.avail, { color: '#2e7d32' }]}>
          Є місця · до {max} гостей/номер
          {roomsNeeded > 1 ? ` · потрібно ~${roomsNeeded} номери` : ''}
        </Text>
        <Text style={[styles.desc, { color: colors.text }]} numberOfLines={2}>
          {hotel.description}
        </Text>
        <Text style={[styles.priceBase, { color: colors.tabIconDefault }]}>
          {Math.round(hotel.pricePerNight)} грн × {search.guests} осіб × {search.nights}{' '}
          {search.nights === 1 ? 'ніч' : 'ночей'}
        </Text>
        <Text style={[styles.price, { color: colors.tint }]}>
          Разом ~ {total} грн
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.form, { borderColor: colors.tabIconDefault, backgroundColor: '#fff' }]}>
        <View style={styles.row}>
          <TextInput
            style={[styles.field, { borderColor: colors.tabIconDefault, color: colors.text }]}
            placeholder="Куда (город отеля)"
            placeholderTextColor={colors.tabIconDefault}
            value={search.toCity}
            onChangeText={search.setToCity}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.row}>
          <Pressable
            style={[styles.fieldBtn, { borderColor: colors.tabIconDefault }]}
            onPress={() => setDateField('checkIn')}
          >
            <RNText style={styles.tinyLabel}>Заїзд</RNText>
            <RNText style={[styles.fieldBtnText, { color: colors.text }]}>
              {formatUaDate(search.checkIn)}
            </RNText>
          </Pressable>
          <Pressable
            style={[styles.fieldBtn, { borderColor: colors.tabIconDefault }]}
            onPress={() => setDateField('checkOut')}
          >
            <RNText style={styles.tinyLabel}>Виїзд</RNText>
            <RNText style={[styles.fieldBtnText, { color: colors.text }]}>
              {formatUaDate(search.checkOut)}
            </RNText>
          </Pressable>
          <View style={[styles.guestsBox, { borderColor: colors.tabIconDefault }]}>
            <RNText style={styles.tinyLabel}>Люди</RNText>
            <View style={styles.guestsRow}>
              <Pressable onPress={() => search.setGuests(search.guests - 1)} hitSlop={6}>
                <RNText style={[styles.stepBtnText, { color: colors.tint }]}>−</RNText>
              </Pressable>
              <RNText style={[styles.guestsValue, { color: colors.text }]}>{search.guests}</RNText>
              <Pressable onPress={() => search.setGuests(search.guests + 1)} hitSlop={6}>
                <RNText style={[styles.stepBtnText, { color: colors.tint }]}>+</RNText>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable style={[styles.searchBtn, { backgroundColor: colors.tint }]} onPress={onSearch}>
          <RNText style={styles.searchBtnText}>Знайти</RNText>
        </Pressable>

        <View style={styles.chipsWrap}>
          <Pressable
            style={[
              styles.chip,
              { borderColor: colors.tint },
              onlyFavs && { backgroundColor: colors.tint },
            ]}
            onPress={() => setOnlyFavs((v) => !v)}
          >
            <RNText style={[styles.chipText, onlyFavs && styles.chipTextOn]}>♥ Обране</RNText>
          </Pressable>
          {CITY_CHIPS.map((city) => {
            const active = search.toCity.trim().toLowerCase() === city.toLowerCase();
            return (
              <Pressable
                key={city}
                style={[
                  styles.chip,
                  { borderColor: colors.tint },
                  active && { backgroundColor: colors.tint },
                ]}
                onPress={() => pickCity(city)}
              >
                <RNText style={[styles.chipText, active && styles.chipTextOn]}>{city}</RNText>
              </Pressable>
            );
          })}
          {search.toCity.trim() ? (
            <Pressable
              style={[styles.chip, { borderColor: colors.tabIconDefault }]}
              onPress={async () => {
                search.setToCity('');
                setLoading(true);
                await load();
                setLoading(false);
              }}
            >
              <RNText style={styles.chipText}>Усі</RNText>
            </Pressable>
          ) : null}
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} size="large" />
        </View>
      ) : (
        <FlatList
          data={visibleHotels}
          keyExtractor={(x) => String(x.hotel.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.tabIconDefault }]}>
              Немає вільних місць під {search.guests} ос. Спробуй менше людей або інше місто.
            </Text>
          }
        />
      )}

      {dateField && Platform.OS === 'android' ? (
        <DateTimePicker
          value={dateField === 'checkIn' ? search.checkIn : search.checkOut}
          mode="date"
          minimumDate={dateField === 'checkIn' ? new Date() : search.checkIn}
          onChange={onDateChange}
        />
      ) : null}

      {dateField && Platform.OS === 'ios' ? (
        <Modal transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={[styles.modalCard, { backgroundColor: '#fff' }]}>
              <DateTimePicker
                value={dateField === 'checkIn' ? search.checkIn : search.checkOut}
                mode="date"
                display="spinner"
                minimumDate={dateField === 'checkIn' ? new Date() : search.checkIn}
                onChange={onDateChange}
              />
              <Pressable
                style={[styles.searchBtn, { backgroundColor: colors.tint }]}
                onPress={() => setDateField(null)}
              >
                <RNText style={styles.searchBtnText}>Готово</RNText>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 8, paddingHorizontal: 12 },
  form: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    gap: 6,
  },
  row: { flexDirection: 'row', gap: 6 },
  field: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    minHeight: 34,
  },
  fieldBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    minHeight: 34,
  },
  fieldBtnText: { fontSize: 11, fontWeight: '600' },
  tinyLabel: { fontSize: 9, color: '#a89080', fontWeight: '700', marginBottom: 1 },
  guestsBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 72,
    justifyContent: 'center',
  },
  guestsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  stepBtnText: { fontSize: 16, fontWeight: '700', lineHeight: 18 },
  guestsValue: { fontSize: 13, fontWeight: '800', minWidth: 16, textAlign: 'center' },
  searchBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  chipText: { fontSize: 12, fontWeight: '700', color: '#2b1d14' },
  chipTextOn: { color: '#fff' },
  list: { paddingBottom: 28, flexGrow: 1 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#e8ddd2',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartText: { fontSize: 20, color: '#c0392b', fontWeight: '700' },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { fontSize: 40 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  hotelName: { fontSize: 17, fontWeight: '800', flex: 1 },
  rating: { fontSize: 14, fontWeight: '700' },
  place: { fontSize: 13, marginTop: 4 },
  avail: { fontSize: 13, fontWeight: '600', marginTop: 4, marginBottom: 4 },
  desc: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  priceBase: { fontSize: 12, marginBottom: 2 },
  price: { fontSize: 16, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', marginTop: 40, lineHeight: 20, paddingHorizontal: 12 },
  error: { color: '#c0392b', marginBottom: 8, lineHeight: 20 },
  modalBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalCard: { padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
});
