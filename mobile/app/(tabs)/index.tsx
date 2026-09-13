import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
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
  formatGuestsLabel,
  formatUaDate,
  useSearch,
} from '@/context/SearchContext';
import { useFavorites } from '@/context/FavoritesContext';

type DateField = 'checkIn' | 'checkOut' | null;
type SheetKind = 'sort' | 'filters' | null;
type SortKey = 'default' | 'priceAsc' | 'priceDesc' | 'ratingDesc';

const CITY_CHIPS = ['Київ', 'Львів', 'Одеса', 'Warszawa', 'Berlin', 'Praha'];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: 'За замовчуванням' },
  { key: 'priceAsc', label: 'Ціна (від низької до високої)' },
  { key: 'priceDesc', label: 'Ціна (від високої до низької)' },
  { key: 'ratingDesc', label: 'Рейтинг об’єкта (від високого)' },
];

const PRICE_OPTIONS: { max: number | null; label: string }[] = [
  { max: null, label: 'Будь-яка' },
  { max: 1600, label: 'До 1600 грн/ніч' },
  { max: 2000, label: 'До 2000 грн/ніч' },
  { max: 2500, label: 'До 2500 грн/ніч' },
];

const RATING_OPTIONS: { min: number | null; label: string }[] = [
  { min: null, label: 'Будь-який' },
  { min: 4.0, label: '★ 4.0 і вище' },
  { min: 4.5, label: '★ 4.5 і вище' },
  { min: 4.7, label: '★ 4.7 і вище' },
];

const COUNTRY_OPTIONS: { value: string | null; label: string }[] = [
  { value: null, label: 'Будь-яка' },
  { value: 'Україна', label: 'Україна' },
  { value: 'Polska', label: 'Polska' },
  { value: 'Deutschland', label: 'Deutschland' },
  { value: 'Česko', label: 'Česko' },
  { value: 'Österreich', label: 'Österreich' },
];

const AMENITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'Wi', label: 'Wi‑Fi' },
  { value: 'Сніданок', label: 'Сніданок включено' },
  { value: 'Парковка', label: 'Парковка' },
  { value: 'Море', label: 'Море поруч' },
  { value: 'Спа', label: 'Спа-зона' },
  { value: 'Центр', label: 'Центр міста' },
  { value: 'Хостел', label: 'Хостел' },
];

const CAPACITY_OPTIONS: { min: number | null; label: string }[] = [
  { min: null, label: 'Будь-яка' },
  { min: 3, label: 'Від 3 гостей' },
  { min: 4, label: 'Від 4 гостей' },
  { min: 6, label: 'Від 6 гостей' },
];

function hotelHasAmenity(hotel: Hotel, needle: string): boolean {
  if (!needle) return true;
  const list = hotel.amenities ?? [];
  const n = needle.toLowerCase();
  return list.some((a) => a && a.toLowerCase().includes(n));
}

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
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [minCapacity, setMinCapacity] = useState<number | null>(null);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [formCollapsed, setFormCollapsed] = useState(false);

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
    setFormCollapsed(true);
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
    let rows = hotels
      .map((h) => {
        const max = h.maxGuests ?? 2;
        const fits = search.guests <= max;
        const roomsNeeded = Math.max(1, Math.ceil(search.guests / max));
        const total = estimateStayPrice(h.pricePerNight, search.guests, search.nights);
        return { hotel: h, fits, roomsNeeded, total, max };
      })
      // Показуємо всі готелі міста; якщо людей більше — підказка про кілька номерів
      .filter((x) => !onlyFavs || favs.isFavorite(x.hotel.id))
      .filter((x) => maxPrice == null || Number(x.hotel.pricePerNight) <= maxPrice)
      .filter((x) => minRating == null || x.hotel.rating >= minRating)
      .filter((x) => country == null || x.hotel.country === country)
      .filter(
        (x) =>
          amenities.length === 0 || amenities.every((a) => hotelHasAmenity(x.hotel, a))
      )
      .filter((x) => minCapacity == null || (x.hotel.maxGuests ?? 2) >= minCapacity);

    if (sortKey === 'priceAsc') {
      rows = [...rows].sort(
        (a, b) => Number(a.hotel.pricePerNight) - Number(b.hotel.pricePerNight)
      );
    } else if (sortKey === 'priceDesc') {
      rows = [...rows].sort(
        (a, b) => Number(b.hotel.pricePerNight) - Number(a.hotel.pricePerNight)
      );
    } else if (sortKey === 'ratingDesc') {
      rows = [...rows].sort((a, b) => b.hotel.rating - a.hotel.rating);
    }

    return rows;
  }, [
    hotels,
    search.guests,
    search.nights,
    onlyFavs,
    favs,
    sortKey,
    maxPrice,
    minRating,
    country,
    amenities,
    minCapacity,
  ]);

  const activeFilterCount =
    (maxPrice != null ? 1 : 0) +
    (minRating != null ? 1 : 0) +
    (country != null ? 1 : 0) +
    amenities.length +
    (minCapacity != null ? 1 : 0);

  const resetFilters = () => {
    setMaxPrice(null);
    setMinRating(null);
    setCountry(null);
    setAmenities([]);
    setMinCapacity(null);
  };

  const toggleAmenity = (value: string) => {
    setAmenities((cur) =>
      cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]
    );
  };

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
    const { hotel, fits, roomsNeeded, total, max } = item;
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
        <Text style={[styles.avail, { color: fits ? '#2e7d32' : '#c0392b' }]}>
          {fits
            ? `Є місця · до ${max} гостей/номер`
            : `Тісно для ${search.guests} ос. · до ${max}/номер · потрібно ~${roomsNeeded} номери`}
          {hotel.roomSizeM2 ? ` · ${hotel.roomSizeM2} м²` : ''}
        </Text>
        {hotel.roomType || hotel.beds ? (
          <Text style={[styles.place, { color: colors.tabIconDefault }]} numberOfLines={1}>
            {[hotel.roomType, hotel.beds].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
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
        {formCollapsed ? (
          <Pressable
            style={styles.summaryBar}
            onPress={() => setFormCollapsed(false)}
          >
            <RNText style={styles.summaryBack}>←</RNText>
            <View style={styles.summaryTextWrap}>
              <RNText style={[styles.summaryTitle, { color: colors.text }]} numberOfLines={1}>
                {search.toCity.trim() || 'Усі міста'}
              </RNText>
              <RNText style={styles.summaryMeta} numberOfLines={1}>
                {formatUaDate(search.checkIn)} — {formatUaDate(search.checkOut)} ·{' '}
                {formatGuestsLabel(search.adults, search.children)}
              </RNText>
            </View>
            <RNText style={[styles.summaryEdit, { color: colors.tint }]}>Змінити</RNText>
          </Pressable>
        ) : (
          <>
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
            </View>

            <View style={styles.row}>
              <View style={[styles.guestsBox, { borderColor: colors.tabIconDefault, flex: 1 }]}>
                <RNText style={styles.tinyLabel}>Дорослі</RNText>
                <View style={styles.guestsRow}>
                  <Pressable onPress={() => search.setAdults(search.adults - 1)} hitSlop={6}>
                    <RNText style={[styles.stepBtnText, { color: colors.tint }]}>−</RNText>
                  </Pressable>
                  <RNText style={[styles.guestsValue, { color: colors.text }]}>
                    {search.adults}
                  </RNText>
                  <Pressable onPress={() => search.setAdults(search.adults + 1)} hitSlop={6}>
                    <RNText style={[styles.stepBtnText, { color: colors.tint }]}>+</RNText>
                  </Pressable>
                </View>
              </View>
              <View style={[styles.guestsBox, { borderColor: colors.tabIconDefault, flex: 1 }]}>
                <RNText style={styles.tinyLabel}>Діти</RNText>
                <View style={styles.guestsRow}>
                  <Pressable onPress={() => search.setChildren(search.children - 1)} hitSlop={6}>
                    <RNText style={[styles.stepBtnText, { color: colors.tint }]}>−</RNText>
                  </Pressable>
                  <RNText style={[styles.guestsValue, { color: colors.text }]}>
                    {search.children}
                  </RNText>
                  <Pressable onPress={() => search.setChildren(search.children + 1)} hitSlop={6}>
                    <RNText style={[styles.stepBtnText, { color: colors.tint }]}>+</RNText>
                  </Pressable>
                </View>
              </View>
            </View>

            <Pressable style={[styles.searchBtn, { backgroundColor: colors.tint }]} onPress={onSearch}>
              <RNText style={styles.searchBtnText}>Знайти</RNText>
            </Pressable>
          </>
        )}

        <View style={styles.toolbar}>
          <Pressable style={styles.toolBtn} onPress={() => setSheet('sort')}>
            <RNText style={styles.toolIcon}>☰</RNText>
            <RNText style={[styles.toolText, { color: colors.text }]}>Сортування</RNText>
            {sortKey !== 'default' ? <View style={styles.toolDot} /> : null}
          </Pressable>
          <View style={styles.toolDivider} />
          <Pressable style={styles.toolBtn} onPress={() => setSheet('filters')}>
            <RNText style={styles.toolIcon}>⚙</RNText>
            <RNText style={[styles.toolText, { color: colors.text }]}>Фільтр</RNText>
            {activeFilterCount > 0 ? (
              <View style={styles.badge}>
                <RNText style={styles.badgeText}>{activeFilterCount}</RNText>
              </View>
            ) : (
              <RNText style={styles.toolChevron}>▼</RNText>
            )}
          </Pressable>
        </View>

        {!formCollapsed ? (
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
        ) : onlyFavs ? (
          <View style={styles.chipsWrap}>
            <Pressable
              style={[styles.chip, { borderColor: colors.tint, backgroundColor: colors.tint }]}
              onPress={() => setOnlyFavs(false)}
            >
              <RNText style={[styles.chipText, styles.chipTextOn]}>♥ Обране</RNText>
            </Pressable>
          </View>
        ) : null}
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
              Нічого не знайдено для «{search.toCity.trim() || 'усі міста'}» (
              {formatGuestsLabel(search.adults, search.children)}). Скинь фільтри або зменш
              кількість гостей.
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

      <Modal
        visible={sheet === 'sort'}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <Pressable style={styles.sheetBg} onPress={() => setSheet(null)}>
          <Pressable style={styles.sheetCard} onPress={(e) => e.stopPropagation?.()}>
            <View style={styles.sheetHandle} />
            <RNText style={styles.sheetTitle}>Сортувати</RNText>
            {SORT_OPTIONS.map((o) => (
              <Pressable
                key={o.key}
                style={styles.radioRow}
                onPress={() => {
                  setSortKey(o.key);
                  setSheet(null);
                }}
              >
                <RNText style={styles.radioLabel}>{o.label}</RNText>
                <View style={[styles.radioOuter, sortKey === o.key && styles.radioOuterOn]}>
                  {sortKey === o.key ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={sheet === 'filters'}
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <View style={[styles.filterScreen, { backgroundColor: '#fff' }]}>
          <View style={[styles.filterHeader, { backgroundColor: colors.tint }]}>
            <Pressable onPress={() => setSheet(null)} hitSlop={10}>
              <RNText style={styles.filterHeaderBtn}>←</RNText>
            </Pressable>
            <RNText style={styles.filterHeaderTitle}>Фільтри</RNText>
            <Pressable onPress={resetFilters} hitSlop={10}>
              <RNText style={styles.filterHeaderBtn}>Скинути</RNText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.filterBody}>
            <RNText style={styles.sectionTitle}>Ваш бюджет (за ніч)</RNText>
            {PRICE_OPTIONS.map((o) => (
              <Pressable
                key={String(o.max)}
                style={styles.checkRow}
                onPress={() => setMaxPrice(o.max)}
              >
                <RNText style={styles.checkLabel}>{o.label}</RNText>
                <View style={[styles.radioOuter, maxPrice === o.max && styles.radioOuterOn]}>
                  {maxPrice === o.max ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            ))}

            <RNText style={styles.sectionTitle}>Рейтинг</RNText>
            {RATING_OPTIONS.map((o) => (
              <Pressable
                key={String(o.min)}
                style={styles.checkRow}
                onPress={() => setMinRating(o.min)}
              >
                <RNText style={styles.checkLabel}>{o.label}</RNText>
                <View style={[styles.radioOuter, minRating === o.min && styles.radioOuterOn]}>
                  {minRating === o.min ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            ))}

            <RNText style={styles.sectionTitle}>Країна</RNText>
            {COUNTRY_OPTIONS.map((o) => (
              <Pressable
                key={String(o.value)}
                style={styles.checkRow}
                onPress={() => setCountry(o.value)}
              >
                <RNText style={styles.checkLabel}>{o.label}</RNText>
                <View style={[styles.radioOuter, country === o.value && styles.radioOuterOn]}>
                  {country === o.value ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            ))}

            <RNText style={styles.sectionTitle}>Популярні фільтри</RNText>
            {AMENITY_OPTIONS.map((o) => {
              const on = amenities.includes(o.value);
              return (
                <Pressable
                  key={o.value}
                  style={styles.checkRow}
                  onPress={() => toggleAmenity(o.value)}
                >
                  <RNText style={styles.checkLabel}>{o.label}</RNText>
                  <View style={[styles.checkbox, on && styles.checkboxOn]}>
                    {on ? <RNText style={styles.checkboxMark}>✓</RNText> : null}
                  </View>
                </Pressable>
              );
            })}

            <RNText style={styles.sectionTitle}>Місткість номера</RNText>
            {CAPACITY_OPTIONS.map((o) => (
              <Pressable
                key={String(o.min)}
                style={styles.checkRow}
                onPress={() => setMinCapacity(o.min)}
              >
                <RNText style={styles.checkLabel}>{o.label}</RNText>
                <View style={[styles.radioOuter, minCapacity === o.min && styles.radioOuterOn]}>
                  {minCapacity === o.min ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.filterFooter}>
            <RNText style={styles.filterCount}>
              Знайдено варіантів: {visibleHotels.length}
            </RNText>
            <Pressable
              style={[styles.showBtn, { backgroundColor: colors.tint }]}
              onPress={() => setSheet(null)}
            >
              <RNText style={styles.showBtnText}>Показати результати</RNText>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  summaryBack: { fontSize: 18, fontWeight: '700', color: '#5a4538', paddingHorizontal: 2 },
  summaryTextWrap: { flex: 1, minWidth: 0 },
  summaryTitle: { fontSize: 14, fontWeight: '800' },
  summaryMeta: { fontSize: 12, color: '#a89080', marginTop: 1 },
  summaryEdit: { fontSize: 12, fontWeight: '700' },
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0d4c8',
    marginTop: 2,
    paddingTop: 4,
  },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
  },
  toolDivider: { width: 1, height: 18, backgroundColor: '#e0d4c8' },
  toolIcon: { fontSize: 13, color: '#5a4538' },
  toolText: { fontSize: 13, fontWeight: '700' },
  toolChevron: { fontSize: 9, color: '#a89080', marginLeft: 2 },
  toolDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#c0392b',
    marginLeft: 2,
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#c0392b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginLeft: 2,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  sheetBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheetCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d0c4b8',
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#2b1d14', marginBottom: 8 },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee4da',
  },
  radioLabel: { flex: 1, fontSize: 15, color: '#2b1d14', paddingRight: 12 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#c4b4a4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterOn: { borderColor: '#8b5e3c' },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8b5e3c',
  },
  filterScreen: { flex: 1 },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'ios' ? 52 : 14,
  },
  filterHeaderTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  filterHeaderBtn: { color: '#fff', fontSize: 15, fontWeight: '700' },
  filterBody: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2b1d14',
    marginTop: 18,
    marginBottom: 6,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee4da',
  },
  checkLabel: { flex: 1, fontSize: 15, color: '#2b1d14', paddingRight: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#c4b4a4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: '#8b5e3c', borderColor: '#8b5e3c' },
  checkboxMark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  filterFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee4da',
    padding: 14,
    gap: 8,
    backgroundColor: '#fff',
  },
  filterCount: { textAlign: 'center', color: '#6b5a4e', fontSize: 13 },
  showBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  showBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
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
