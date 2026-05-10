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

function AccountPage() {
  const { user, logout, walletBalance, transactions, deposit, bookingsForUser } = useApp();
  const [topUp, setTopUp] = useState(200);

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
            <div className="mt-3 text-3xl font-semibold">TND {walletBalance.toLocaleString()}</div>
          </div>
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.24em] mb-3">Account details</h3>
              <div className="space-y-2 text-sm text-foreground">
                <div><span className="font-semibold">Email:</span> {user.email}</div>
                <div><span className="font-semibold">Phone:</span> {user.phone}</div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.24em] mb-3">Quick links</h3>
              <div className="space-y-2 text-sm">
                <Link to="/bookings" className="text-primary hover:underline">My bookings</Link>
                <Link to="/flights" className="text-primary hover:underline">Search flights</Link>
                <Link to="/hotels" className="text-primary hover:underline">Search hotels</Link>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-8">
          <section className="rounded-3xl border border-border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold">Top up wallet</h3>
                <p className="text-sm text-muted-foreground">Use wallet credit for bookings and quick reservations.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_170px]">
              <input
                type="number"
                value={topUp}
                min={50}
                onChange={(event) => setTopUp(Math.max(50, Number(event.target.value)))}
                className="rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={() => deposit(topUp)} className="btn-primary w-full">Add TND {topUp}</button>
            </div>
          </section>

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
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="rounded-3xl border border-border p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{tx.note}</div>
                      <div className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</div>
                    </div>
                    <div className={`text-sm font-semibold ${tx.type === "deposit" ? "text-primary" : "text-destructive"}`}>
                      {tx.type === "deposit" ? "+" : "-"} TND {tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

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
                {bookingsForUser.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="rounded-3xl border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">{booking.title}</div>
                        <div className="text-xs text-muted-foreground">{booking.type} · {booking.status}</div>
                      </div>
                      <div className="text-sm font-semibold">TND {booking.price}</div>
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
