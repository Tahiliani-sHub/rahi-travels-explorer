import { createFileRoute, Link } from "@tanstack/react-router";
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

function BookingsPage() {
  const { user, bookingsForUser } = useApp();

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
      {bookingsForUser.length === 0 ? (
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
          {bookingsForUser.map((booking) => (
            <div key={booking.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">{booking.type}</p>
                  <h2 className="text-xl font-semibold mb-2">{booking.title}</h2>
                  <div className="text-sm text-muted-foreground">{booking.details}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">{booking.status}</div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div>Price: TND {booking.price}</div>
                <div>Guests: {booking.guests}</div>
                <div>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
