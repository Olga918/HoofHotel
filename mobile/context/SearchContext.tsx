import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type SearchParams = {
  toCity: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
};

type SearchContextValue = SearchParams & {
  setToCity: (v: string) => void;
  setCheckIn: (v: Date) => void;
  setCheckOut: (v: Date) => void;
  setGuests: (v: number) => void;
  nights: number;
};

const SearchContext = createContext<SearchContextValue | null>(null);

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return startOfDay(x);
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [toCity, setToCity] = useState('');
  const [checkIn, setCheckIn] = useState(() => addDays(new Date(), 1));
  const [checkOut, setCheckOut] = useState(() => addDays(new Date(), 3));
  const [guests, setGuests] = useState(2);

  const nights = useMemo(() => {
    const ms = startOfDay(checkOut).getTime() - startOfDay(checkIn).getTime();
    const n = Math.round(ms / (24 * 60 * 60 * 1000));
    return Math.max(1, n);
  }, [checkIn, checkOut]);

  const value = useMemo(
    () => ({
      toCity,
      checkIn,
      checkOut,
      guests,
      setToCity,
      setCheckIn: (v: Date) => {
        const next = startOfDay(v);
        setCheckIn(next);
        setCheckOut((out) => (out <= next ? addDays(next, 1) : out));
      },
      setCheckOut: (v: Date) => {
        const next = startOfDay(v);
        setCheckOut(next <= checkIn ? addDays(checkIn, 1) : next);
      },
      setGuests: (v: number) => setGuests(Math.min(12, Math.max(1, v))),
      nights,
    }),
    [toCity, checkIn, checkOut, guests, nights]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}

/** Ціна залежить від кількості людей і ночей. */
export function estimateStayPrice(pricePerNight: number, guests: number, nights: number) {
  return Math.round(pricePerNight * guests * nights);
}

export function formatUaDate(d: Date) {
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
}
