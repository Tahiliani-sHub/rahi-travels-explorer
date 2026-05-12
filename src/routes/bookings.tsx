import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/components/site/AppProvider";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My bookings — Rahi Travels" },
      { name: "description", content: "Review your upcoming and past travel bookings." },
    ],
  }),
  component: BookingsPage,
});

type DbBooking = {
  id: string;
  bookingId: string;
  type: string;
  details: Record<string, any>;
  totalAmount: number;
  currency: string;
  status: string;
  departDate?: string;
  createdAt: string;
};

function bookingTitle(b: DbBooking): string {
  const d = b.details;
  switch (b.type) {
    case "flight":
      return `${d.airline ?? ""} ${d.flightNumber ?? ""} — ${d.origin ?? ""} → ${d.destination ?? ""}`.trim();
    case "hotel":
      return `${d.hotel ?? d.name ?? "Hotel"}, ${d.city ?? ""}`.trim();
    case "train":
      return `${d.operator ?? ""} ${d.trainNumber ?? ""} — ${d.origin ?? ""} → ${d.destination ?? ""}`.trim();
    case "holiday":
      return `${d.destination ?? "Holiday"} trip`;
    case "package":
      return d.packageName ?? d.name ?? "Package booking";
    default:
      return b.bookingId;
  }
}

function bookingSubtitle(b: DbBooking): string {
  const d = b.details;
  switch (b.type) {
    case "flight":
      return `${d.departDate ?? ""} · ${d.departTime ?? ""} → ${d.arriveTime ?? ""} · ${d.cabin ?? ""}`;
    case "hotel":
      return `${d.checkIn ?? ""} → ${d.checkOut ?? ""} · ${d.nights ?? ""} night(s) · ${d.rooms ?? 1} room(s)`;
    case "train":
      return `${d.departDate ?? ""} · ${d.departTime ?? ""} → ${d.arriveTime ?? ""} · ${d.seatClass ?? ""}`;
    case "holiday":
      return d.date ? `Departure: ${d.date} · ${d.guests ?? ""} guest(s)` : "";
    case "package":
      return d.tier ? `${d.tier} tier · ${d.nights ?? ""} night(s) · ${d.guests ?? ""} guest(s)` : "";
    default:
      return "";
  }
}

const STATUS_COLOURS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-slate-100 text-slate-600",
};

function BookingsPage() {
  const { user } = useApp();
  const [bookings, setBookings] = useState<DbBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch(`/api/bookings?userId=${user.id}`)
      .then(r => r.json())
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Cancel this booking? This cannot be undone.")) return;
    setCancelling(bookingId);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Rahi-Request": "true" },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: "cancelled" } : b));
      }
    } finally {
      setCancelling(null);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <div className="rounded-3xl border border-border bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-semibold mb-4">Please sign in</h1>
          <p className="text-muted-foreground mb-6">View your booking history after login.</p>
          <Link to="/login" className="btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">My bookings</h1>
            <p className="text-muted-foreground">Your confirmed trips, pending reservations, and travel plans.</p>
          </div>
          <Link to="/flights" className="btn-outline">Search flights</Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-6 w-64 rounded" />
                <div className="skeleton h-4 w-48 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-border bg-white p-12 text-center">
          <h2 className="text-xl font-semibold mb-3">No bookings yet</h2>
          <p className="text-muted-foreground mb-6">Start by searching flights, hotels, or packages.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/flights" className="btn-primary">Search flights</Link>
            <Link to="/hotels" className="btn-outline">Search hotels</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-1">{booking.type}</p>
                  <h2 className="text-xl font-semibold mb-1">{bookingTitle(booking)}</h2>
                  <div className="text-sm text-muted-foreground">{bookingSubtitle(booking)}</div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${STATUS_COLOURS[booking.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {booking.status}
                  </span>
                  <div className="text-lg font-semibold">{booking.currency} {booking.totalAmount.toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground border-t border-border pt-4">
                <div>Booking ID: <span className="font-mono text-xs">{booking.bookingId}</span></div>
                <div>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</div>
                <div className="flex gap-2">
                  <a
                    href={`/api/bookings/download-pdf?bookingId=${booking.bookingId}`}
                    className="text-primary hover:underline text-sm"
                    download
                  >
                    Download PDF
                  </a>
                  {booking.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancel(booking.bookingId)}
                      disabled={cancelling === booking.bookingId}
                      className="text-destructive hover:underline text-sm disabled:opacity-50"
                    >
                      {cancelling === booking.bookingId ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
