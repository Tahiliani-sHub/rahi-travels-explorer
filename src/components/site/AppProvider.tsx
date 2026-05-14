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

export type SavedItem = {
  id: string;
  type: "flight" | "hotel" | "train" | "holiday";
  title: string;
  subtitle: string;
  price: number;
  savedAt: string;
  meta: Record<string, unknown>;
};

export type AppContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  signup: (details: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loginWithToken: (user: User, sessionToken: string) => void;
  updateProfile: (data: Partial<User>) => void;
  bookings: BookingItem[];
  bookingsForUser: BookingItem[];
  addBooking: (booking: Omit<BookingItem, "id" | "createdAt" | "ownerId" | "status" | "date">) => boolean;
  walletBalance: number;
  transactions: WalletTransaction[];
  recordTransaction: (tx: Omit<WalletTransaction, "id" | "date">) => void;
  spend: (amount: number, note: string, pkgId?: string) => Promise<boolean>;
  savedPackageIds: string[];
  comparePackageIds: string[];
  toggleSavedPackage: (pkgId: string) => void;
  toggleComparePackage: (pkgId: string) => void;
  isSavedPackage: (pkgId: string) => boolean;
  isComparedPackage: (pkgId: string) => boolean;
  savedItems: SavedItem[];
  toggleSavedItem: (item: SavedItem) => void | Promise<void>;
  isSavedItem: (id: string) => boolean;
  appliedCoupon: { code: string; discount: number; finalAmount: number } | null;
  applyCouponCode: (code: string, amount: number) => Promise<boolean>;
  removeCoupon: () => void;
  refreshBalance: () => Promise<void>;
};

const STORAGE_KEY = "rahi_travels_app_state";
const AppContext = createContext<AppContextValue | null>(null);

function getAuthHeader() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("sessionToken") ?? "" : "";
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Rahi-Request": "true" };
}

const JSON_HEADERS = { "Content-Type": "application/json", "X-Rahi-Request": "true" } as const;

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
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; finalAmount: number } | null>(null);

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
          savedItems?: SavedItem[];
        };
        if (parsed?.user) setUser(parsed.user);
        if (Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
        if (Array.isArray(parsed.bookings)) setBookings(parsed.bookings);
        if (typeof parsed.walletBalance === "number") setWalletBalance(parsed.walletBalance);
        if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
        if (Array.isArray(parsed.savedPackageIds)) setSavedPackageIds(parsed.savedPackageIds);
        if (Array.isArray(parsed.comparePackageIds)) setComparePackageIds(parsed.comparePackageIds);
        if (Array.isArray(parsed.savedItems)) setSavedItems(parsed.savedItems);
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
        savedItems,
      }),
    );
  }, [user, accounts, bookings, walletBalance, transactions, savedPackageIds, comparePackageIds, savedItems]);

  const login = async ({ email, password }: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.sessionToken) {
          window.localStorage.setItem('sessionToken', data.sessionToken);
        }
        // Sync wallet balance and saved items from DB
        fetch(`/api/wallet?userId=${data.user.id}`)
          .then(r => r.json())
          .then(w => { if (typeof w.balance === 'number') setWalletBalance(w.balance); })
          .catch(() => {});
        fetch('/api/saved-items', { headers: { Authorization: `Bearer ${data.sessionToken}` } })
          .then(r => r.json())
          .then((items: any[]) => { if (Array.isArray(items)) setSavedItems(items.map(i => ({ id: i.itemId, type: i.type, title: i.title, subtitle: i.subtitle, price: i.price, savedAt: i.savedAt, meta: i.meta }))); })
          .catch(() => {});
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const signup = async ({ name, email, phone, password }: { name: string; email: string; phone: string; password: string }) => {
    if (!name || !email || !phone || !password) {
      return { success: false, message: "All fields are required." };
    }
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ name, email, phone, password })
      });

      const raw = await res.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error("Signup: non-JSON response", res.status, raw.slice(0, 300));
        return { success: false, message: `Server error (${res.status}). Check console for details.` };
      }

      if (!res.ok || !data.success) {
        return { success: false, message: data.error || "An account with this email already exists." };
      }

      setUser(data.user);
      if (data.sessionToken) {
        window.localStorage.setItem('sessionToken', data.sessionToken);
      }
      return { success: true };
    } catch (err: any) {
      console.error("Signup fetch failed:", err);
      return { success: false, message: "Cannot reach server. Check your connection or try again." };
    }
  };

  const loginWithToken = (userData: User, sessionToken: string) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sessionToken", sessionToken);
    }
  };

  const logout = () => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("sessionToken") ?? "" : "";
    if (token) {
      fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}`, "X-Rahi-Request": "true" } }).catch(() => {});
      window.localStorage.removeItem("sessionToken");
    }
    setUser(null);
    setSavedItems([]);
  };

  const updateProfile = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : prev);
  };

  const addBooking = (booking: Omit<BookingItem, "id" | "createdAt" | "ownerId" | "status" | "date">) => {
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

  const recordTransaction = (tx: Omit<WalletTransaction, "id" | "date">) => {
    const full: WalletTransaction = {
      ...tx,
      id: createTransactionId(),
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [full, ...prev]);
  };

  const spend = async (amount: number, note: string, pkgId?: string): Promise<boolean> => {
    if (amount <= 0 || amount > walletBalance || !user) return false;
    try {
      const res = await fetch('/api/wallet/spend', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ userId: user.id, amount })
      });
      const data = await res.json();
      if (!res.ok) return false;
      if (typeof data.balance === 'number') setWalletBalance(data.balance);
    } catch {
      // fallback to local update
      setWalletBalance((prev) => prev - amount);
    }
    const transaction: WalletTransaction = {
      id: createTransactionId(),
      type: "spend",
      amount,
      date: new Date().toISOString(),
      note,
      pkgId,
    };
    setTransactions((prev) => [transaction, ...prev]);
    return true;
  };

  const toggleSavedPackage = (pkgId: string) => {
    setSavedPackageIds((prev) => (prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]));
  };

  const toggleComparePackage = (pkgId: string) => {
    setComparePackageIds((prev) => (prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]));
  };

  const toggleSavedItem = async (item: SavedItem) => {
    // Optimistic update first
    setSavedItems((prev) =>
      prev.some((s) => s.id === item.id) ? prev.filter((s) => s.id !== item.id) : [item, ...prev],
    );
    try {
      await fetch('/api/saved-items', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ itemId: item.id, type: item.type, title: item.title, subtitle: item.subtitle, price: item.price, meta: item.meta }),
      });
    } catch {
      // Rollback on failure
      setSavedItems((prev) =>
        prev.some((s) => s.id === item.id) ? prev.filter((s) => s.id !== item.id) : [item, ...prev],
      );
    }
  };

  const applyCouponCode = async (code: string, amount: number) => {
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ code, amount })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid coupon');
      }

      const data = await response.json();
      setAppliedCoupon({
        code: data.coupon,
        discount: data.discount,
        finalAmount: data.finalAmount
      });
      return true;
    } catch (error) {
      console.error('Coupon error:', error);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const refreshBalance = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/wallet?userId=${user.id}`);
      const data = await res.json();
      if (typeof data.balance === "number") setWalletBalance(data.balance);
    } catch {}
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      loginWithToken,
      updateProfile,
      bookings,
      bookingsForUser: user ? bookings.filter((booking) => booking.ownerId === user.id) : [],
      addBooking,
      walletBalance,
      transactions,
      recordTransaction,
      spend,
      savedPackageIds,
      comparePackageIds,
      toggleSavedPackage,
      toggleComparePackage,
      isSavedPackage: (pkgId: string) => savedPackageIds.includes(pkgId),
      isComparedPackage: (pkgId: string) => comparePackageIds.includes(pkgId),
      savedItems,
      toggleSavedItem,
      isSavedItem: (id: string) => savedItems.some((s) => s.id === id),
      appliedCoupon,
      applyCouponCode,
      removeCoupon,
      refreshBalance,
    }),
    [user, bookings, walletBalance, transactions, savedPackageIds, comparePackageIds, savedItems, appliedCoupon],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
