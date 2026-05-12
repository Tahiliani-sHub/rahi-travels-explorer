import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageSquare, ChevronDown } from "lucide-react";
import { useApp } from "@/components/site/AppProvider";
import { SearchAutocomplete } from "@/components/site/SearchAutocomplete";
import { type Train } from "@/data/trains";
import { PaymentModal } from "@/components/site/PaymentModal";
import { ReviewForm } from "@/components/site/ReviewForm";
import { ReviewList } from "@/components/site/ReviewList";

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
  const [tripType, setTripType] = useState<"one-way" | "return">("one-way");
  const [origin, setOrigin] = useState("TUN");
  const [destination, setDestination] = useState("SFA");
  const [departDate, setDepartDate] = useState("2026-06-08");
  const [returnDate, setReturnDate] = useState("2026-06-15");
  const [seatClass, setSeatClass] = useState("Any");
  const [passengers, setPassengers] = useState(1);
  const [bookedTrainId, setBookedTrainId] = useState<string | null>(null);
  const [paymentTrain, setPaymentTrain] = useState<Train | null>(null);
  const [selectedOutbound, setSelectedOutbound] = useState<Train | null>(null);
  const [returnTrain, setReturnTrain] = useState<Train | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<string | null>(null);

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

  const { data: returnResults = [], isLoading: isLoadingReturn } = useQuery<Train[]>({
    queryKey: ['trains-return', destination, origin, returnDate, seatClass],
    queryFn: async () => {
      const params = new URLSearchParams({ origin: destination, destination: origin, departDate: returnDate, seatClass });
      const res = await fetch(`/api/search/trains?${params}`);
      if (!res.ok) throw new Error('Failed to fetch return trains');
      return res.json();
    },
    enabled: tripType === "return" && !!origin && !!destination && !!returnDate,
  });

  const handleBook = (train: Train, isReturn = false) => {
    if (!user) { window.location.assign("/login?next=/trains"); return; }
    if (tripType === "return") {
      if (!isReturn) {
        setSelectedOutbound(prev => prev?.id === train.id ? null : train);
        setReturnTrain(null);
        return;
      }
      if (!selectedOutbound) { alert("Please select an outbound train first."); return; }
      setReturnTrain(train);
      setPaymentTrain(selectedOutbound);
      return;
    }
    setPaymentTrain(train);
  };

  const bundledAmount = paymentTrain && returnTrain
    ? (paymentTrain.price + returnTrain.price) * passengers
    : paymentTrain ? paymentTrain.price * passengers : 0;

  const handlePaymentComplete = () => {
    if (!paymentTrain) return;
    if (returnTrain) {
      addBooking({
        type: "train",
        title: `${paymentTrain.operator} ${paymentTrain.trainNumber} + ${returnTrain.trainNumber}`,
        category: `${paymentTrain.origin} → ${paymentTrain.destination} (Return)`,
        details: `Out: ${paymentTrain.departDate} ${paymentTrain.departTime}–${paymentTrain.arriveTime} | Ret: ${returnTrain.departDate} ${returnTrain.departTime}–${returnTrain.arriveTime}`,
        price: bundledAmount,
        guests: passengers,
      });
      setBookedTrainId(returnTrain.id);
    } else {
      addBooking({
        type: "train",
        title: `${paymentTrain.operator} ${paymentTrain.trainNumber}`,
        category: `${paymentTrain.origin} → ${paymentTrain.destination}`,
        details: `${paymentTrain.departDate} • ${paymentTrain.departTime} → ${paymentTrain.arriveTime} • ${paymentTrain.seatClass}`,
        price: paymentTrain.price * passengers,
        guests: passengers,
      });
      setBookedTrainId(paymentTrain.id);
    }
    setPaymentTrain(null);
    setReturnTrain(null);
    setSelectedOutbound(null);
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
        <div className="flex gap-2 mb-4">
          {(["one-way", "return"] as const).map(t => (
            <button key={t} type="button" onClick={() => setTripType(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tripType === t ? "bg-primary text-white" : "bg-slate-100 text-muted-foreground hover:bg-slate-200"}`}>
              {t === "one-way" ? "One-way" : "Return"}
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr_1fr]">
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
            <span className="text-sm font-medium text-muted-foreground">Return {tripType === "one-way" && <span className="text-xs opacity-50">(one-way)</span>}</span>
            <input
              type="date"
              value={returnDate}
              onChange={(event) => setReturnDate(event.target.value)}
              disabled={tripType === "one-way"}
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-40 disabled:bg-slate-50"
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
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_0.9fr_0.9fr] items-center">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-24 rounded" />
                  <div className="skeleton h-6 w-40 rounded" />
                  <div className="skeleton h-3 w-32 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="skeleton h-5 w-16 rounded" />
                  <div className="skeleton h-3 w-12 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="skeleton h-5 w-16 rounded" />
                  <div className="skeleton h-3 w-12 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="skeleton h-5 w-20 rounded" />
                  <div className="skeleton h-3 w-28 rounded" />
                </div>
                <div className="space-y-2 flex flex-col items-end">
                  <div className="skeleton h-8 w-24 rounded" />
                  <div className="skeleton h-10 w-full rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
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
                  <div className="text-3xl font-semibold">€{train.price * passengers}</div>
                  <button
                    onClick={() => handleBook(train)}
                    className={`mt-3 w-full justify-center btn-primary ${tripType === "return" && selectedOutbound?.id === train.id ? "!bg-green-600" : ""}`}
                  >
                    {bookedTrainId === train.id ? "Booked ✓" : tripType === "return" ? (selectedOutbound?.id === train.id ? "Selected ✓" : "Select outbound") : "Book train"}
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
                  <button
                    type="button"
                    onClick={() => setExpandedReviews(expandedReviews === train.id ? null : train.id)}
                    className="mt-2 inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-muted-foreground hover:border-primary transition w-full justify-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Reviews
                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedReviews === train.id ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
              {expandedReviews === train.id && (
                <div className="mt-4 border-t border-border pt-4 space-y-4">
                  <ReviewList itemId={train.id} currentUserId={user?.id} />
                  <ReviewForm itemId={train.id} itemType="train" userId={user?.id} userName={user?.name} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tripType === "return" && (returnResults.length > 0 || isLoadingReturn) && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Return trains — {destination} → {origin} · {returnDate}</h2>
          {isLoadingReturn ? (
            <div className="space-y-4">{[0,1].map(i => <div key={i} className="rounded-3xl border border-border bg-white p-6 shadow-sm"><div className="skeleton h-16 w-full rounded-2xl" /></div>)}</div>
          ) : (
            <div className="space-y-5">
              {returnResults.slice(0, 5).map((train) => (
                <div key={train.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                  <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_0.9fr_0.9fr] items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">{train.operator}</p>
                      <h2 className="text-xl font-semibold">{train.origin} → {train.destination}</h2>
                      <div className="text-sm text-muted-foreground mt-2">{train.trainNumber} · {train.departDate}</div>
                    </div>
                    <div><div className="font-semibold">{train.departTime}</div><div className="text-sm text-muted-foreground">Depart</div></div>
                    <div><div className="font-semibold">{train.arriveTime}</div><div className="text-sm text-muted-foreground">Arrive</div></div>
                    <div><div className="font-semibold">{train.duration}</div><div className="text-sm text-muted-foreground">{train.seatClass}</div></div>
                    <div className="text-right">
                      <div className="text-3xl font-semibold">€{train.price * passengers}</div>
                      {selectedOutbound && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Bundle total: €{(selectedOutbound.price + train.price) * passengers}
                        </div>
                      )}
                      <button onClick={() => handleBook(train, true)} className="btn-primary mt-3 w-full justify-center" disabled={!selectedOutbound}>
                        {bookedTrainId === train.id ? "Booked ✓" : selectedOutbound ? "Book return bundle" : "Select outbound first"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {paymentTrain && (
        <PaymentModal
          open={!!paymentTrain}
          onClose={() => { setPaymentTrain(null); setReturnTrain(null); }}
          amount={bundledAmount}
          bookingType="train"
          bookingDetails={returnTrain ? {
            operator: `${paymentTrain.operator}`,
            trainNumber: `${paymentTrain.trainNumber} / ${returnTrain.trainNumber}`,
            origin: paymentTrain.origin,
            destination: paymentTrain.destination,
            departDate: paymentTrain.departDate,
            departTime: paymentTrain.departTime,
            arriveTime: paymentTrain.arriveTime,
            returnDate: returnTrain.departDate,
            returnDepartTime: returnTrain.departTime,
            returnArriveTime: returnTrain.arriveTime,
            seatClass: paymentTrain.seatClass,
            passengers,
          } : {
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
