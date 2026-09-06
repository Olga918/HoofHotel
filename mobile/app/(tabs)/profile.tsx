import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Text } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Mode = 'login' | 'register';

export default function ProfileScreen() {
  const { user, ready, login, register, logout } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, displayName.trim());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося виконати запит');
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (user) {
    return (
      <View style={[styles.center, styles.pad, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Профіль</Text>
        <Text style={[styles.hello, { color: colors.text }]}>
          Вітаємо, {user.displayName}!
        </Text>
        <Text style={[styles.meta, { color: colors.tabIconDefault }]}>{user.email}</Text>
        <Text style={[styles.apiHint, { color: colors.tabIconDefault }]}>
          API: {API_BASE_URL}
        </Text>
        <Pressable
          style={[styles.btn, styles.btnOutline, { borderColor: colors.tint }]}
          onPress={async () => {
            await logout();
            setEmail('');
            setPassword('');
            setDisplayName('');
            setError(null);
            setMode('login');
          }}
        >
          <Text style={[styles.btnOutlineText, { color: colors.tint }]}>Вийти</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>
          {mode === 'login' ? 'Вхід' : 'Реєстрація'}
        </Text>
        <Text style={[styles.slogan, { color: colors.tabIconDefault }]}>
          Найди ночлег. Без лишней скачки.
        </Text>

        <View style={styles.switchRow}>
          <Pressable
            style={[styles.chip, mode === 'login' && { backgroundColor: colors.tint }]}
            onPress={() => {
              setMode('login');
              setError(null);
            }}
          >
            <Text style={[styles.chipText, mode === 'login' && styles.chipTextOn]}>
              Вхід
            </Text>
          </Pressable>
          <Pressable
            style={[styles.chip, mode === 'register' && { backgroundColor: colors.tint }]}
            onPress={() => {
              setMode('register');
              setError(null);
            }}
          >
            <Text style={[styles.chipText, mode === 'register' && styles.chipTextOn]}>
              Реєстрація
            </Text>
          </Pressable>
        </View>

        {mode === 'register' ? (
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.tabIconDefault, color: colors.text, backgroundColor: '#fff' },
            ]}
            placeholder="Ім'я"
            placeholderTextColor={colors.tabIconDefault}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
        ) : null}

        <TextInput
          style={[
            styles.input,
            { borderColor: colors.tabIconDefault, color: colors.text, backgroundColor: '#fff' },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.tabIconDefault}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.tabIconDefault, color: colors.text, backgroundColor: '#fff' },
          ]}
          placeholder="Пароль (мін. 6 символів)"
          placeholderTextColor={colors.tabIconDefault}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.btn, { backgroundColor: colors.tint, opacity: busy ? 0.6 : 1 }]}
          onPress={onSubmit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              {mode === 'login' ? 'Увійти' : 'Створити акаунт'}
            </Text>
          )}
        </Pressable>

        <Text style={[styles.apiHint, { color: colors.tabIconDefault }]}>
          API: {API_BASE_URL}
        </Text>
        <Text style={[styles.hint, { color: colors.tabIconDefault }]}>
          Спочатку запусти backend: dotnet run у папці api. Телефон і ПК — в одній Wi‑Fi.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pad: { padding: 24, paddingBottom: 40, flexGrow: 1 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  slogan: { fontSize: 15, marginBottom: 18 },
  hello: { fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  meta: { fontSize: 15, marginBottom: 8 },
  switchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#e8ddd2',
  },
  chipText: { fontWeight: '700', color: '#2b1d14' },
  chipTextOn: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    minWidth: 160,
    marginTop: 20,
  },
  btnOutlineText: { fontWeight: '700', fontSize: 16 },
  error: { color: '#c0392b', marginBottom: 8, lineHeight: 20 },
  apiHint: { marginTop: 16, fontSize: 12 },
  hint: { marginTop: 8, fontSize: 13, lineHeight: 18 },
});
