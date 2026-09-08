import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Text } from '@/components/Themed';
import { cancelBooking, fetchMyBookings, type Booking } from '@/lib/api';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/AuthContext';

export default function BookingsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const { user, ready } = useAuth();
  const router = useRouter();

  const [list, setList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setList([]);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      setList(await fetchMyBookings(user.token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося завантажити броні');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onCancel = (b: Booking) => {
    if (!user) return;
    Alert.alert('Скасувати бронь?', `${b.hotelName}\n${b.checkIn} → ${b.checkOut}`, [
      { text: 'Ні', style: 'cancel' },
      {
        text: 'Так, скасувати',
        style: 'destructive',
        onPress: async () => {
          setBusyId(b.id);
          try {
            await cancelBooking(user.token, b.id);
            await load();
          } catch (e) {
            Alert.alert('Помилка', e instanceof Error ? e.message : 'Не вдалося');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  if (!ready || loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.center, styles.pad, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Мої броні</Text>
        <Text style={[styles.hint, { color: colors.tabIconDefault }]}>
          Увійди в акаунт, щоб бачити бронювання.
        </Text>
        <Pressable
          style={[styles.btn, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <RNText style={styles.btnText}>Увійти</RNText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Мої броні</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={list}
        keyExtractor={(b) => String(b.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.hint, { color: colors.tabIconDefault }]}>
            Поки порожньо, як конюшня без сіна. Знайди готель у Пошуку і натисни «Забронювати».
          </Text>
        }
        renderItem={({ item: b }) => {
          const cancelled = b.status === 'Cancelled';
          return (
            <View
              style={[
                styles.card,
                {
                  borderColor: colors.tabIconDefault,
                  backgroundColor: '#fff',
                  opacity: cancelled ? 0.65 : 1,
                },
              ]}
            >
              <View style={styles.row}>
                <Text style={[styles.hotel, { color: colors.text }]}>{b.hotelName}</Text>
                <RNText
                  style={{
                    color: cancelled ? '#c0392b' : '#2e7d32',
                    fontWeight: '700',
                    fontSize: 12,
                  }}
                >
                  {cancelled ? 'Скасовано' : 'Підтверджено'}
                </RNText>
              </View>
              <Text style={[styles.meta, { color: colors.tabIconDefault }]}>
                {b.city}, {b.country}
              </Text>
              <Text style={[styles.meta, { color: colors.text }]}>
                {b.checkIn} → {b.checkOut} · {b.guests} ос.
              </Text>
              <Text style={[styles.price, { color: colors.tint }]}>
                {Math.round(Number(b.totalPrice))} грн
              </Text>
              {!cancelled ? (
                <Pressable
                  style={[styles.cancelBtn, { borderColor: colors.tint }]}
                  disabled={busyId === b.id}
                  onPress={() => onCancel(b)}
                >
                  {busyId === b.id ? (
                    <ActivityIndicator color={colors.tint} />
                  ) : (
                    <RNText style={{ color: colors.tint, fontWeight: '700' }}>Скасувати</RNText>
                  )}
                </Pressable>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 12, paddingHorizontal: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pad: { paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
  hint: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  error: { color: '#c0392b', marginBottom: 8 },
  list: { paddingBottom: 28, flexGrow: 1 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' },
  hotel: { fontSize: 16, fontWeight: '800', flex: 1 },
  meta: { fontSize: 13, marginTop: 4 },
  price: { fontSize: 16, fontWeight: '800', marginTop: 8 },
  cancelBtn: {
    marginTop: 12,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btn: {
    marginTop: 16,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnText: { color: '#fff', fontWeight: '800' },
});
