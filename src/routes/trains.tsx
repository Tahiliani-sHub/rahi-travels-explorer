import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useApp } from "@/components/site/AppProvider";
import { SearchAutocomplete } from "@/components/site/SearchAutocomplete";
import { type Train } from "@/data/trains";
import { PaymentModal } from "@/components/site/PaymentModal";

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
  const { user, addBooking, toggleSavedItem, isSavedItem } = useApp();
  const [origin, setOrigin] = useState("TUN");
  const [destination, setDestination] = useState("SFA");
  const [departDate, setDepartDate] = useState("2026-06-08");
  const [seatClass, setSeatClass] = useState("Any");
  const [passengers, setPassengers] = useState(1);
  const [bookedTrainId, setBookedTrainId] = useState<string | null>(null);
  const [paymentTrain, setPaymentTrain] = useState<Train | null>(null);

  const { data: results = [], isLoading } = useQuery<Train[]>({
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
    setPaymentTrain(train);
  };

  const handlePaymentComplete = () => {
    if (!paymentTrain) return;
    addBooking({
      type: "train",
      title: `${paymentTrain.operator} ${paymentTrain.trainNumber}`,
      category: `${paymentTrain.origin} → ${paymentTrain.destination}`,
      details: `${paymentTrain.departDate} • ${paymentTrain.departTime} → ${paymentTrain.arriveTime} • ${paymentTrain.seatClass}`,
      price: paymentTrain.price * passengers,
      guests: passengers,
    });
    setBookedTrainId(paymentTrain.id);
    setPaymentTrain(null);
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
            <div className="mt-2">
              <SearchAutocomplete
                value={origin}
                onChange={(value) => setOrigin(value.toUpperCase())}
                placeholder="TUN"
                type="train"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">To</span>
            <div className="mt-2">
              <SearchAutocomplete
                value={destination}
                onChange={(value) => setDestination(value.toUpperCase())}
                placeholder="SFA"
                type="train"
              />
            </div>
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
                    {bookedTrainId === train.id ? "Booked ✓" : "Book train"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) { window.location.assign("/login?next=/trains"); return; }
                      toggleSavedItem({
                        id: train.id,
                        type: "train",
                        title: `${train.operator} ${train.trainNumber}`,
                        subtitle: `${train.origin} → ${train.destination} · ${train.departDate}`,
                        price: train.price * passengers,
                        savedAt: new Date().toISOString(),
                        meta: { ...train, passengers } as Record<string, unknown>
                      });
                    }}
                    className={`mt-2 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition w-full justify-center ${isSavedItem(train.id) ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-muted-foreground hover:border-primary"}`}
                  >
                    <Heart className="w-3.5 h-3.5" /> {isSavedItem(train.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {paymentTrain && (
        <PaymentModal
          open={!!paymentTrain}
          onClose={() => setPaymentTrain(null)}
          amount={paymentTrain.price * passengers}
          bookingType="train"
          bookingDetails={{
            operator: paymentTrain.operator,
            trainNumber: paymentTrain.trainNumber,
            origin: paymentTrain.origin,
            destination: paymentTrain.destination,
            departDate: paymentTrain.departDate,
            departTime: paymentTrain.departTime,
            arriveTime: paymentTrain.arriveTime,
            seatClass: paymentTrain.seatClass,
            passengers,
          }}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
