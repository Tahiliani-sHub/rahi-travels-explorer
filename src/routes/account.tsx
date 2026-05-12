import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/components/site/AppProvider";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account — Rahi Travels" },
      { name: "description", content: "View your profile, wallet balance, and booking history." },
    ],
  }),
  component: AccountPage,
});

function authHeader() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("sessionToken") ?? "" : "";
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Rahi-Request": "true" };
}

function AccountPage() {
  const { user, updateProfile, logout, walletBalance, transactions, refreshBalance, recordTransaction, bookingsForUser } = useApp();
  const [topUpAmount, setTopUpAmount] = useState(200);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState("");
  const [topUpSuccess, setTopUpSuccess] = useState("");

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editPhone, setEditPhone] = useState(user?.phone ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password change state
  const [pwMode, setPwMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      const data = await res.json();
      if (!res.ok) { setProfileMsg(data.error || "Failed to save"); return; }
      updateProfile(data.user);
      setProfileMsg("Profile updated.");
      setEditMode(false);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPwMsg("Passwords do not match."); return; }
    if (newPassword.length < 8) { setPwMsg("Password must be at least 8 characters."); return; }
    setPwSaving(true);
    setPwMsg("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setPwMsg(data.error || "Failed"); return; }
      setPwMsg("Password changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
      setPwMode(false);
    } finally {
      setPwSaving(false);
    }
  };

  const handleTopUp = async () => {
    if (!user || topUpAmount < 10) return;
    setTopUpLoading(true);
    setTopUpError("");
    setTopUpSuccess("");

    try {
      // Load Razorpay script
      await new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) { resolve(); return; }
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Could not load payment gateway"));
        document.body.appendChild(s);
      });

      // Create order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Rahi-Request": "true" },
        body: JSON.stringify({ amount: topUpAmount, description: "Wallet top-up" }),
      });
      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create payment order");
      }
      const { orderId, keyId, amount: orderAmount, currency } = await orderRes.json();

      // Open Razorpay checkout
      await new Promise<void>((resolve, reject) => {
        const options = {
          key: keyId,
          amount: orderAmount,
          currency,
          name: "Rahi Travels",
          description: "Wallet top-up",
          order_id: orderId,
          prefill: { email: user.email, name: user.name },
          theme: { color: "#2563eb" },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch("/api/wallet/topup-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Rahi-Request": "true" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: user.id,
                  amount: topUpAmount,
                }),
              });
              const data = await verifyRes.json();
              if (!verifyRes.ok || !data.success) {
                reject(new Error("Payment verification failed"));
                return;
              }
              await refreshBalance();
              recordTransaction({ type: "deposit", amount: topUpAmount, note: "Wallet top-up" });
              setTopUpSuccess(`€${topUpAmount} added to your wallet.`);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("cancelled")) },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Top-up failed";
      if (msg !== "cancelled") setTopUpError(msg);
    } finally {
      setTopUpLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <div className="rounded-3xl border border-border bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-semibold mb-4">Sign in to view your account</h1>
          <p className="text-muted-foreground mb-6">Your profile, wallet credit, and bookings are available after login.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/login" className="btn-primary">Sign in</Link>
            <Link to="/signup" className="btn-outline">Create account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border border-border bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-muted-foreground">Logged in as</p>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
            </div>
            <button onClick={logout} className="btn-outline">Sign out</button>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-slate-50 p-6 mb-6">
            <p className="text-sm text-muted-foreground">Wallet balance</p>
            <div className="mt-3 text-3xl font-semibold">€{walletBalance.toLocaleString()}</div>
          </div>
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.24em] mb-3">Account details</h3>
              <div className="space-y-2 text-sm text-foreground">
                <div><span className="font-semibold">Email:</span> {user.email}</div>
                <div><span className="font-semibold">Phone:</span> {user.phone || "—"}</div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.24em] mb-3">Quick links</h3>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/bookings" className="text-primary hover:underline">My bookings</Link>
                <Link to="/flights" className="text-primary hover:underline">Search flights</Link>
                <Link to="/hotels" className="text-primary hover:underline">Search hotels</Link>
                <Link to="/admin/coupons" className="text-primary hover:underline">Coupon admin</Link>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-8">
          {/* Profile Edit */}
          <section className="rounded-3xl border border-border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold">Profile</h3>
                <p className="text-sm text-muted-foreground">Update your name and phone number.</p>
              </div>
              {!editMode && (
                <button onClick={() => { setEditMode(true); setEditName(user.name); setEditPhone(user.phone ?? ""); }} className="btn-outline">Edit</button>
              )}
            </div>
            {editMode ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {profileMsg && <p className="text-sm text-destructive">{profileMsg}</p>}
                <label className="block">
                  <span className="text-sm font-medium text-muted-foreground">Name</span>
                  <input value={editName} onChange={e => setEditName(e.target.value)} required className="mt-1 w-full rounded-2xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-muted-foreground">Phone</span>
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="mt-1 w-full rounded-2xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
                <div className="flex gap-3">
                  <button type="submit" disabled={profileSaving} className="btn-primary disabled:opacity-50">{profileSaving ? "Saving..." : "Save changes"}</button>
                  <button type="button" onClick={() => { setEditMode(false); setProfileMsg(""); }} className="btn-outline">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex gap-2"><span className="font-semibold w-16">Name</span><span>{user.name}</span></div>
                <div className="flex gap-2"><span className="font-semibold w-16">Email</span><span>{user.email}</span></div>
                <div className="flex gap-2"><span className="font-semibold w-16">Phone</span><span>{user.phone || "Not set"}</span></div>
              </div>
            )}
          </section>

          {/* Password Change */}
          <section className="rounded-3xl border border-border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold">Password</h3>
                <p className="text-sm text-muted-foreground">Change your account password.</p>
              </div>
              {!pwMode && <button onClick={() => setPwMode(true)} className="btn-outline">Change password</button>}
            </div>
            {pwMode && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {pwMsg && <p className={`text-sm ${pwMsg.includes("success") ? "text-green-600" : "text-destructive"}`}>{pwMsg}</p>}
                <label className="block">
                  <span className="text-sm font-medium text-muted-foreground">New password</span>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} className="mt-1 w-full rounded-2xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-muted-foreground">Confirm password</span>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} className="mt-1 w-full rounded-2xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
                <div className="flex gap-3">
                  <button type="submit" disabled={pwSaving} className="btn-primary disabled:opacity-50">{pwSaving ? "Saving..." : "Update password"}</button>
                  <button type="button" onClick={() => { setPwMode(false); setPwMsg(""); }} className="btn-outline">Cancel</button>
                </div>
              </form>
            )}
          </section>

          {/* Wallet Top-up */}
          <section className="rounded-3xl border border-border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold">Top up wallet</h3>
                <p className="text-sm text-muted-foreground">Pay securely via Razorpay — funds are credited instantly after payment.</p>
              </div>
            </div>
            {topUpError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{topUpError}</div>
            )}
            {topUpSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{topUpSuccess}</div>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {[100, 200, 500, 1000].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTopUpAmount(preset)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${topUpAmount === preset ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"}`}
                >
                  €{preset}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_190px]">
              <input
                type="number"
                value={topUpAmount}
                min={10}
                onChange={e => setTopUpAmount(Math.max(10, Number(e.target.value)))}
                className="rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleTopUp}
                disabled={topUpLoading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {topUpLoading ? "Processing..." : `Pay €${topUpAmount}`}
              </button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">🔒 Secured by Razorpay</p>
          </section>

          {/* Wallet Transactions */}
          <section className="rounded-3xl border border-border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold">Recent wallet activity</h3>
                <p className="text-sm text-muted-foreground">Track deposits and booking spends.</p>
              </div>
            </div>
            {transactions.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-6 text-sm text-muted-foreground">No wallet activity yet.</div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx: any) => (
                  <div key={tx.id} className="rounded-3xl border border-border p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{tx.note}</div>
                      <div className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</div>
                    </div>
                    <div className={`text-sm font-semibold ${tx.type === "deposit" ? "text-primary" : "text-destructive"}`}>
                      {tx.type === "deposit" ? "+" : "-"} €{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Bookings */}
          <section className="rounded-3xl border border-border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold">Recent bookings</h3>
                <p className="text-sm text-muted-foreground">A summary of your most recent confirmed trips.</p>
              </div>
              <Link to="/bookings" className="text-primary hover:underline">View all</Link>
            </div>
            {bookingsForUser.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-6 text-sm text-muted-foreground">You have not booked any trips yet.</div>
            ) : (
              <div className="space-y-4">
                {bookingsForUser.slice(0, 3).map((booking: any) => (
                  <div key={booking.id} className="rounded-3xl border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">{booking.title}</div>
                        <div className="text-xs text-muted-foreground">{booking.type} · {booking.status}</div>
                      </div>
                      <div className="text-sm font-semibold">€{booking.price}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">{booking.details}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
