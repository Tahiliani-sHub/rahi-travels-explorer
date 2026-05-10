import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

function createTransactionId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type AppUserAccount = User & {
  password: string;
};

export type BookingItem = {
  id: string;
  type: "flight" | "hotel" | "package" | "train" | "holiday";
  title: string;
  category: string;
  details: string;
  price: number;
  guests: number;
  status: "Confirmed" | "Pending";
  date: string;
  createdAt: string;
  ownerId: string;
};

export type WalletTransaction = {
  id: string;
  type: "deposit" | "spend";
  amount: number;
  date: string;
  note: string;
  pkgId?: string;
};

export type AppContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => boolean;
  signup: (details: { name: string; email: string; phone: string; password: string }) => { success: boolean; message?: string };
  logout: () => void;
  bookings: BookingItem[];
  bookingsForUser: BookingItem[];
  addBooking: (booking: Omit<BookingItem, "id" | "createdAt" | "ownerId" | "status">) => boolean;
  walletBalance: number;
  transactions: WalletTransaction[];
  deposit: (amount: number) => void;
  spend: (amount: number, note: string, pkgId?: string) => boolean;
  savedPackageIds: string[];
  comparePackageIds: string[];
  toggleSavedPackage: (pkgId: string) => void;
  toggleComparePackage: (pkgId: string) => void;
  isSavedPackage: (pkgId: string) => boolean;
  isComparedPackage: (pkgId: string) => boolean;
};

const STORAGE_KEY = "rahi_travels_app_state";
const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("AppProvider is missing");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<AppUserAccount[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [savedPackageIds, setSavedPackageIds] = useState<string[]>([]);
  const [comparePackageIds, setComparePackageIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          user?: User | null;
          accounts?: AppUserAccount[];
          bookings?: BookingItem[];
          walletBalance?: number;
          transactions?: WalletTransaction[];
          savedPackageIds?: string[];
          comparePackageIds?: string[];
        };
        if (parsed?.user) setUser(parsed.user);
        if (Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
        if (Array.isArray(parsed.bookings)) setBookings(parsed.bookings);
        if (typeof parsed.walletBalance === "number") setWalletBalance(parsed.walletBalance);
        if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
        if (Array.isArray(parsed.savedPackageIds)) setSavedPackageIds(parsed.savedPackageIds);
        if (Array.isArray(parsed.comparePackageIds)) setComparePackageIds(parsed.comparePackageIds);
      } catch {
        // ignore invalid state
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user,
        accounts,
        bookings,
        walletBalance,
        transactions,
        savedPackageIds,
        comparePackageIds,
      }),
    );
  }, [user, accounts, bookings, walletBalance, transactions, savedPackageIds, comparePackageIds]);

  const login = ({ email, password }: { email: string; password: string }) => {
    const account = accounts.find((account) => account.email.toLowerCase() === email.toLowerCase());
    if (!account || account.password !== password) {
      return false;
    }
    setUser({ id: account.id, name: account.name, email: account.email, phone: account.phone });
    return true;
  };

  const signup = ({ name, email, phone, password }: { name: string; email: string; phone: string; password: string }) => {
    if (!name || !email || !phone || !password) {
      return { success: false, message: "All fields are required." };
    }
    if (accounts.some((account) => account.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "An account with this email already exists." };
    }

    const newUser: AppUserAccount = {
      id: createTransactionId(),
      name,
      email,
      phone,
      password,
    };
    setAccounts((prev) => [...prev, newUser]);
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const addBooking = (booking: Omit<BookingItem, "id" | "createdAt" | "ownerId" | "status">) => {
    if (!user) return false;
    const newBooking: BookingItem = {
      id: createTransactionId(),
      ownerId: user.id,
      status: "Confirmed",
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
      ...booking,
    };
    setBookings((prev) => [newBooking, ...prev]);
    return true;
  };

  const deposit = (amount: number) => {
    if (amount <= 0) return;
    const transaction: WalletTransaction = {
      id: createTransactionId(),
      type: "deposit",
      amount,
      date: new Date().toISOString(),
      note: "Wallet top-up",
    };
    setWalletBalance((prev) => prev + amount);
    setTransactions((prev) => [transaction, ...prev]);
  };

  const spend = (amount: number, note: string, pkgId?: string) => {
    if (amount <= 0 || amount > walletBalance) return false;
    const transaction: WalletTransaction = {
      id: createTransactionId(),
      type: "spend",
      amount,
      date: new Date().toISOString(),
      note,
      pkgId,
    };
    setWalletBalance((prev) => prev - amount);
    setTransactions((prev) => [transaction, ...prev]);
    return true;
  };

  const toggleSavedPackage = (pkgId: string) => {
    setSavedPackageIds((prev) => (prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]));
  };

  const toggleComparePackage = (pkgId: string) => {
    setComparePackageIds((prev) => (prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]));
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      bookings,
      bookingsForUser: user ? bookings.filter((booking) => booking.ownerId === user.id) : [],
      addBooking,
      walletBalance,
      transactions,
      deposit,
      spend,
      savedPackageIds,
      comparePackageIds,
      toggleSavedPackage,
      toggleComparePackage,
      isSavedPackage: (pkgId: string) => savedPackageIds.includes(pkgId),
      isComparedPackage: (pkgId: string) => comparePackageIds.includes(pkgId),
    }),
    [user, bookings, walletBalance, transactions, savedPackageIds, comparePackageIds],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
