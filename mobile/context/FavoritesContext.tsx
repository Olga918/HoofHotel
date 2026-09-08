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

const STORAGE_KEY = '@hoofhotel/favorites';

type FavoritesContextValue = {
  ready: boolean;
  ids: number[];
  isFavorite: (hotelId: number) => boolean;
  toggleFavorite: (hotelId: number) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setIds(JSON.parse(raw) as number[]);
      } catch {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next: number[]) => {
    setIds(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const isFavorite = useCallback((hotelId: number) => ids.includes(hotelId), [ids]);

  const toggleFavorite = useCallback(
    async (hotelId: number) => {
      const next = ids.includes(hotelId)
        ? ids.filter((id) => id !== hotelId)
        : [...ids, hotelId];
      await persist(next);
    },
    [ids, persist]
  );

  const value = useMemo(
    () => ({ ready, ids, isFavorite, toggleFavorite }),
    [ready, ids, isFavorite, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
