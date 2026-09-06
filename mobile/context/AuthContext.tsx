import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  loginUser,
  registerUser,
  type AuthUser,
} from '@/lib/api';

const STORAGE_KEY = '@hoofhotel/auth';

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw) as AuthUser);
      } catch {
        // ignore corrupt storage
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next: AuthUser | null) => {
    setUser(next);
    if (next) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const next = await loginUser({ email, password });
      await persist(next);
    },
    [persist]
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const next = await registerUser({ email, password, displayName });
      await persist(next);
    },
    [persist]
  );

  const logout = useCallback(async () => {
    await persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
