import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type SearchParams = {
  toCity: string;
  checkIn: Date;
  checkOut: Date;
  /** Дорослі (мін. 1). */
  adults: number;
  /** Діти (0+). */
  children: number;
};

type SearchContextValue = SearchParams & {
  setToCity: (v: string) => void;
  setCheckIn: (v: Date) => void;
  setCheckOut: (v: Date) => void;
  setAdults: (v: number) => void;
  setChildren: (v: number) => void;
  /** Усього людей = дорослі + діти (для місткості номера і ціни). */
  guests: number;
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
  const [adults, setAdultsState] = useState(2);
  const [childrenCount, setChildrenState] = useState(0);

  const nights = useMemo(() => {
    const ms = startOfDay(checkOut).getTime() - startOfDay(checkIn).getTime();
    const n = Math.round(ms / (24 * 60 * 60 * 1000));
    return Math.max(1, n);
  }, [checkIn, checkOut]);

  const guests = adults + childrenCount;

  const setAdults = (v: number) => {
    const next = Math.min(10, Math.max(1, Math.floor(v)));
    // не більше 12 разом з дітьми
    setAdultsState(Math.min(next, 12 - childrenCount));
  };

  const setChildren = (v: number) => {
    const next = Math.min(8, Math.max(0, Math.floor(v)));
    setChildrenState(Math.min(next, 12 - adults));
  };

  const value = useMemo(
    () => ({
      toCity,
      checkIn,
      checkOut,
      adults,
      children: childrenCount,
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
      setAdults,
      setChildren,
      nights,
    }),
    [toCity, checkIn, checkOut, adults, childrenCount, guests, nights]
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

export function formatGuestsLabel(adults: number, children: number) {
  const a =
    adults === 1 ? '1 дорослий' : adults < 5 ? `${adults} дорослих` : `${adults} дорослих`;
  if (children <= 0) return a;
  const c =
    children === 1 ? '1 дитина' : children < 5 ? `${children} дитини` : `${children} дітей`;
  return `${a} · ${c}`;
}
