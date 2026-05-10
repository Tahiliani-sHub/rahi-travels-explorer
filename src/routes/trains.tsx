import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/components/site/AppProvider";
import { type Train } from "@/data/trains";

export const Route = createFileRoute("/trains")({
  head: () => ({
    meta: [
      { title: "Search trains — Rahi Travels" },
      { name: "description", content: "Search Tunisian train routes and reserve comfortable seats." },
    ],
  }),
  component: TrainsPage,
});

const seatClasses = ["Any", "Economy", "Business", "First"] as const;

function TrainsPage() {
  const { user, addBooking } = useApp();
  const [origin, setOrigin] = useState("TUN");
  const [destination, setDestination] = useState("SFA");
  const [departDate, setDepartDate] = useState("2026-06-08");
  const [seatClass, setSeatClass] = useState("Any");
  const [passengers, setPassengers] = useState(1);
  const [bookedTrainId, setBookedTrainId] = useState<string | null>(null);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['trains', origin, destination, departDate, seatClass],
    queryFn: async () => {
      const params = new URLSearchParams({ origin, destination, departDate, seatClass });
      const res = await fetch(`/api/search/trains?${params}`);
      if (!res.ok) throw new Error('Failed to fetch trains');
      return res.json();
    },
    enabled: !!origin && !!destination,
  });

  const handleBook = (train: Train) => {
    if (!user) {
      window.location.assign("/login?next=/trains");
      return;
    }

    addBooking({
      type: "train",
      title: `${train.operator} ${train.trainNumber}`,
      category: `${train.origin} → ${train.destination}`,
      details: `${train.departDate} • ${train.departTime} → ${train.arriveTime} • ${train.seatClass}`,
      price: train.price * passengers,
      guests: passengers,
    });
    setBookedTrainId(train.id);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
      <div className="mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Search train journeys</h1>
            <p className="text-muted-foreground mt-2">Find train routes across Tunisia with flexible seat classes and easy booking.</p>
          </div>
          <Link to="/holidays" className="btn-outline">Browse holidays</Link>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm mb-10">
        <div className="grid gap-4 md:grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr]">
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
              placeholder="SFA"
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
            <span className="text-sm font-medium text-muted-foreground">Class</span>
            <select
              value={seatClass}
              onChange={(event) => setSeatClass(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {seatClasses.map((option) => (
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
          <p className="text-muted-foreground">Searching trains...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-3xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No train schedules match your search. Try different dates or stations.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {results.map((train) => (
            <div key={train.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_0.9fr_0.9fr] items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{train.operator}</p>
                  <h2 className="text-xl font-semibold">{train.origin} → {train.destination}</h2>
                  <div className="text-sm text-muted-foreground mt-2">{train.trainNumber} · {train.departDate}</div>
                </div>
                <div>
                  <div className="font-semibold">{train.departTime}</div>
                  <div className="text-sm text-muted-foreground">Depart</div>
                </div>
                <div>
                  <div className="font-semibold">{train.arriveTime}</div>
                  <div className="text-sm text-muted-foreground">Arrive</div>
                </div>
                <div>
                  <div className="font-semibold">{train.duration}</div>
                  <div className="text-sm text-muted-foreground">{train.seatClass} • {train.seatsAvailable} seats</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold">TND {train.price * passengers}</div>
                  <button
                    onClick={() => handleBook(train)}
                    className="btn-primary mt-3 w-full justify-center"
                  >
                    {bookedTrainId === train.id ? "Booked" : "Book train"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
