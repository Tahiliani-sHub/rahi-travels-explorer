import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/components/site/AppProvider";
import { type Flight } from "@/data/flights";

export const Route = createFileRoute("/flights")({
  head: () => ({
    meta: [
      { title: "Search flights — Rahi Travels" },
      { name: "description", content: "Search and book flights across Tunisia and international destinations." },
    ],
  }),
  component: FlightsPage,
});

const cabins = ["Any", "Economy", "Premium Economy", "Business", "First"] as const;

function FlightsPage() {
  const { user, addBooking } = useApp();
  const [origin, setOrigin] = useState("TUN");
  const [destination, setDestination] = useState("DJE");
  const [departDate, setDepartDate] = useState("2026-06-08");
  const [cabin, setCabin] = useState("Any");
  const [passengers, setPassengers] = useState(1);
  const [bookedFlightId, setBookedFlightId] = useState<string | null>(null);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['flights', origin, destination, departDate, cabin],
    queryFn: async () => {
      const params = new URLSearchParams({ origin, destination, departDate, cabin });
      const res = await fetch(`/api/search/flights?${params}`);
      if (!res.ok) throw new Error('Failed to fetch flights');
      return res.json();
    },
    enabled: !!origin && !!destination,
  });

  const handleBook = (flight: Flight) => {
    if (!user) {
      window.location.assign("/login?next=/flights");
      return;
    }

    addBooking({
      type: "flight",
      title: `${flight.airline} ${flight.flightNumber}`,
      category: `${flight.origin} → ${flight.destination}`,
      details: `${flight.departDate} • ${flight.departTime} → ${flight.arriveTime} • ${flight.cabin}`,
      price: flight.price * passengers,
      guests: passengers,
    });
    setBookedFlightId(flight.id);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
      <div className="mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Search flights</h1>
            <p className="text-muted-foreground mt-2">Compare flight options and book with secure travel credit.</p>
          </div>
          <Link to="/hotels" className="btn-outline">Search hotels</Link>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm mb-10">
        <div className="grid gap-4 md:grid-cols-[1.25fr_1.25fr_1fr_1fr_1fr]">
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">From</span>
            <input
              value={origin}
              onChange={(event) => setOrigin(event.target.value.toUpperCase())}
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="TUN"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">To</span>
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value.toUpperCase())}
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="DJE"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Depart</span>
            <input
              type="date"
              value={departDate}
              onChange={(event) => setDepartDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Cabin</span>
            <select
              value={cabin}
              onChange={(event) => setCabin(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {cabins.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Passengers</span>
            <input
              type="number"
              min={1}
              value={passengers}
              onChange={(event) => setPassengers(Math.max(1, Number(event.target.value)))}
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-muted-foreground">Searching flights...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-3xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No flights match your search yet. Try a different destination or date.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {results.map((flight) => (
            <div key={flight.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_0.9fr] items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{flight.airline}</p>
                  <h2 className="text-xl font-semibold">{flight.origin} → {flight.destination}</h2>
                  <div className="text-sm text-muted-foreground">{flight.flightNumber} · {flight.departDate}</div>
                </div>
                <div>
                  <div className="font-semibold">{flight.departTime}</div>
                  <div className="text-sm text-muted-foreground">Depart</div>
                </div>
                <div>
                  <div className="font-semibold">{flight.arriveTime}</div>
                  <div className="text-sm text-muted-foreground">Arrive</div>
                </div>
                <div>
                  <div className="font-semibold">{flight.duration}</div>
                  <div className="text-sm text-muted-foreground">{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop(s)`}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold">TND {flight.price * passengers}</div>
                  <button
                    onClick={() => handleBook(flight)}
                    className="btn-primary mt-3 w-full justify-center"
                  >
                    {bookedFlightId === flight.id ? "Booked" : "Book flight"}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div>{flight.cabin}</div>
                <div>{flight.baggage} baggage</div>
                <div>{flight.refundable ? "Refundable" : "Non-refundable"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
