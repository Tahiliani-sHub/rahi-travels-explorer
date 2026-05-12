import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageSquare, ChevronDown } from "lucide-react";
import { useApp } from "@/components/site/AppProvider";
import { type Flight } from "@/data/flights";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchAutocomplete } from "@/components/site/SearchAutocomplete";
import { PaymentModal } from "@/components/site/PaymentModal";
import { ReviewForm } from "@/components/site/ReviewForm";
import { ReviewList } from "@/components/site/ReviewList";

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
  const { user, addBooking, toggleSavedItem, isSavedItem } = useApp();
  const [tripType, setTripType] = useState<"one-way" | "return">("one-way");
  const [origin, setOrigin] = useState("TUN");
  const [destination, setDestination] = useState("DJE");
  const [departDate, setDepartDate] = useState("2026-06-08");
  const [returnDate, setReturnDate] = useState("2026-06-15");
  const [cabin, setCabin] = useState("Any");
  const [passengers, setPassengers] = useState(1);
  const [bookedFlightId, setBookedFlightId] = useState<string | null>(null);
  const [paymentFlight, setPaymentFlight] = useState<Flight | null>(null);
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<string | null>(null);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedStops, setSelectedStops] = useState<number[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [durationRange, setDurationRange] = useState([0, 1440]); // in minutes
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'stops'>('price');

  const { data: results = [], isLoading } = useQuery<Flight[]>({
    queryKey: ['flights', origin, destination, departDate, cabin, passengers],
    queryFn: async () => {
      const params = new URLSearchParams({ origin, destination, departDate, cabin, passengers: String(passengers) });
      const res = await fetch(`/api/search/flights?${params}`);
      if (!res.ok) throw new Error('Failed to fetch flights');
      return res.json();
    },
    enabled: !!origin && !!destination,
  });

  const { data: returnResults = [], isLoading: isLoadingReturn } = useQuery<Flight[]>({
    queryKey: ['flights-return', destination, origin, returnDate, cabin, passengers],
    queryFn: async () => {
      const params = new URLSearchParams({ origin: destination, destination: origin, departDate: returnDate, cabin, passengers: String(passengers) });
      const res = await fetch(`/api/search/flights?${params}`);
      if (!res.ok) throw new Error('Failed to fetch return flights');
      return res.json();
    },
    enabled: tripType === "return" && !!origin && !!destination && !!returnDate,
  });

  // Get unique airlines and price range from results
  const airlines = useMemo(() => {
    const airlineSet = new Set(results.map(f => f.airline));
    return Array.from(airlineSet).sort();
  }, [results]);

  const maxPrice = useMemo(() => {
    if (results.length === 0) return 1000;
    return Math.max(...results.map(f => f.price)) * 1.1;
  }, [results]);

  // Convert duration string to minutes for filtering
  const durationToMinutes = (duration: string) => {
    const parts = duration.split('h');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    return hours * 60 + minutes;
  };

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = results
      .filter(f => f.price >= priceRange[0] && f.price <= priceRange[1])
      .filter(f => selectedStops.length === 0 || selectedStops.includes(f.stops))
      .filter(f => selectedAirlines.length === 0 || selectedAirlines.includes(f.airline))
      .filter(f => {
        const dur = durationToMinutes(f.duration);
        return dur >= durationRange[0] && dur <= durationRange[1];
      });

    // Sort results
    switch (sortBy) {
      case 'price':
        return filtered.sort((a, b) => a.price - b.price);
      case 'duration':
        return filtered.sort((a, b) => durationToMinutes(a.duration) - durationToMinutes(b.duration));
      case 'stops':
        return filtered.sort((a, b) => a.stops - b.stops);
      default:
        return filtered;
    }
  }, [results, priceRange, selectedStops, selectedAirlines, durationRange, sortBy]);

  const handleBook = (flight: Flight, isReturn = false) => {
    if (!user) { window.location.assign("/login?next=/flights"); return; }
    if (tripType === "return") {
      if (!isReturn) {
        // Select outbound leg — don't open payment yet
        setSelectedOutbound(prev => prev?.id === flight.id ? null : flight);
        setReturnFlight(null);
        return;
      }
      // Return leg — bundle with selected outbound
      if (!selectedOutbound) { alert("Please select an outbound flight first."); return; }
      setReturnFlight(flight);
      setPaymentFlight(selectedOutbound); // triggers modal; amount computed below
      return;
    }
    setPaymentFlight(flight);
  };

  const bundledAmount = paymentFlight && returnFlight
    ? (paymentFlight.price + returnFlight.price) * passengers
    : paymentFlight ? paymentFlight.price * passengers : 0;

  const handlePaymentComplete = () => {
    if (!paymentFlight) return;
    if (returnFlight) {
      addBooking({
        type: "flight",
        title: `${paymentFlight.airline} ${paymentFlight.flightNumber} + ${returnFlight.airline} ${returnFlight.flightNumber}`,
        category: `${paymentFlight.origin} → ${paymentFlight.destination} (Return)`,
        details: `Out: ${paymentFlight.departDate} ${paymentFlight.departTime}–${paymentFlight.arriveTime} | Ret: ${returnFlight.departDate} ${returnFlight.departTime}–${returnFlight.arriveTime}`,
        price: bundledAmount,
        guests: passengers,
      });
      setBookedFlightId(returnFlight.id);
    } else {
      addBooking({
        type: "flight",
        title: `${paymentFlight.airline} ${paymentFlight.flightNumber}`,
        category: `${paymentFlight.origin} → ${paymentFlight.destination}`,
        details: `${paymentFlight.departDate} • ${paymentFlight.departTime} → ${paymentFlight.arriveTime} • ${paymentFlight.cabin}`,
        price: paymentFlight.price * passengers,
        guests: passengers,
      });
      setBookedFlightId(paymentFlight.id);
    }
    setPaymentFlight(null);
    setReturnFlight(null);
    setSelectedOutbound(null);
  };

  const toggleStops = (stops: number) => {
    setSelectedStops(prev => 
      prev.includes(stops) ? prev.filter(s => s !== stops) : [...prev, stops]
    );
  };

  const toggleAirline = (airline: string) => {
    setSelectedAirlines(prev => 
      prev.includes(airline) ? prev.filter(a => a !== airline) : [...prev, airline]
    );
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
        <div className="flex gap-2 mb-4">
          {(["one-way", "return"] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTripType(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tripType === t ? "bg-primary text-white" : "bg-slate-100 text-muted-foreground hover:bg-slate-200"}`}
            >
              {t === "one-way" ? "One-way" : "Return"}
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-[1.25fr_1.25fr_1fr_1fr_1fr_1fr]">
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">From</span>
            <div className="mt-2">
              <SearchAutocomplete
                value={origin}
                onChange={setOrigin}
                placeholder="TUN"
                type="flight"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">To</span>
            <div className="mt-2">
              <SearchAutocomplete
                value={destination}
                onChange={setDestination}
                placeholder="DJE"
                type="flight"
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
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_0.9fr] items-center">
                <div className="space-y-2"><div className="skeleton h-4 w-24" /><div className="skeleton h-6 w-40" /><div className="skeleton h-3 w-32" /></div>
                <div className="space-y-2"><div className="skeleton h-5 w-16" /><div className="skeleton h-3 w-12" /></div>
                <div className="space-y-2"><div className="skeleton h-5 w-16" /><div className="skeleton h-3 w-12" /></div>
                <div className="space-y-2"><div className="skeleton h-5 w-20" /><div className="skeleton h-3 w-16" /></div>
                <div className="flex flex-col items-end gap-2"><div className="skeleton h-8 w-24" /><div className="skeleton h-10 w-full rounded-xl" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-3xl border border-border bg-white p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">✈️</div>
          <h3 className="font-semibold mb-2">No flights found</h3>
          <p className="text-muted-foreground text-sm">Try a different destination, date, or cabin class.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Filters Sidebar */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm h-fit">
            <h3 className="font-bold mb-4">Filters</h3>

            {/* Price Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Price (EUR)</label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={maxPrice}
                step={10}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{priceRange[0].toFixed(0)}</span>
                <span>{priceRange[1].toFixed(0)}</span>
              </div>
            </div>

            {/* Duration Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Duration</label>
              <Slider
                value={durationRange}
                onValueChange={setDurationRange}
                min={0}
                max={1440}
                step={30}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.floor(durationRange[0] / 60)}h</span>
                <span>{Math.floor(durationRange[1] / 60)}h</span>
              </div>
            </div>

            {/* Stops Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Stops</label>
              <div className="space-y-2">
                {[0, 1, 2].map(stops => (
                  <label key={stops} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedStops.includes(stops)}
                      onCheckedChange={() => toggleStops(stops)}
                    />
                    <span className="text-sm">{stops === 0 ? 'Non-stop' : `${stops} stop(s)`}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Airlines Filter */}
            {airlines.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Airlines</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {airlines.map(airline => (
                    <label key={airline} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedAirlines.includes(airline)}
                        onCheckedChange={() => toggleAirline(airline)}
                      />
                      <span className="text-sm">{airline}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(selectedStops.length > 0 || selectedAirlines.length > 0 || 
              priceRange[0] > 0 || priceRange[1] < maxPrice ||
              durationRange[0] > 0 || durationRange[1] < 1440) && (
              <button
                onClick={() => {
                  setPriceRange([0, maxPrice]);
                  setSelectedStops([]);
                  setSelectedAirlines([]);
                  setDurationRange([0, 1440]);
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Results */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">{filteredResults.length} flights found</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'duration' | 'stops')}
                className="text-sm border border-border rounded-lg px-3 py-2"
              >
                <option value="price">Sort by: Price</option>
                <option value="duration">Sort by: Duration</option>
                <option value="stops">Sort by: Stops</option>
              </select>
            </div>

            <div className="space-y-5">
              {filteredResults.map((flight) => (
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
                      <div className="text-3xl font-semibold">€{flight.price * passengers}</div>
                      <button
                        onClick={() => handleBook(flight)}
                        className={`mt-3 w-full justify-center btn-primary ${tripType === "return" && selectedOutbound?.id === flight.id ? "!bg-green-600" : ""}`}
                      >
                        {bookedFlightId === flight.id ? "Booked ✓" : tripType === "return" ? (selectedOutbound?.id === flight.id ? "Selected ✓" : "Select outbound") : "Book flight"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div>{flight.cabin}</div>
                      <div>{flight.baggage} baggage</div>
                      <div>{flight.refundable ? "Refundable" : "Non-refundable"}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedReviews(expandedReviews === flight.id ? null : flight.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-muted-foreground hover:border-primary transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Reviews
                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedReviews === flight.id ? "rotate-180" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!user) { window.location.assign("/login?next=/flights"); return; }
                          toggleSavedItem({
                            id: flight.id,
                            type: "flight",
                            title: `${flight.airline} ${flight.flightNumber}`,
                            subtitle: `${flight.origin} → ${flight.destination} · ${flight.departDate}`,
                            price: flight.price * passengers,
                            savedAt: new Date().toISOString(),
                            meta: { ...flight, passengers } as Record<string, unknown>
                          });
                        }}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${isSavedItem(flight.id) ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-muted-foreground hover:border-primary"}`}
                      >
                        <Heart className="w-3.5 h-3.5" /> {isSavedItem(flight.id) ? "Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                  {expandedReviews === flight.id && (
                    <div className="mt-4 border-t border-border pt-4 space-y-4">
                      <ReviewList itemId={flight.id} currentUserId={user?.id} />
                      <ReviewForm itemId={flight.id} itemType="flight" userId={user?.id} userName={user?.name} />
                    </div>
                  )}
                </div>
              ))}

              {filteredResults.length === 0 && (
                <div className="rounded-3xl border border-border bg-white p-12 text-center shadow-sm">
                  <p className="text-muted-foreground">No flights match your filters. Try adjusting your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tripType === "return" && (returnResults.length > 0 || isLoadingReturn) && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Return flights — {destination} → {origin} · {returnDate}</h2>
          {isLoadingReturn ? (
            <div className="space-y-4">
              {[0, 1].map(i => (
                <div key={i} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                  <div className="skeleton h-16 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {returnResults.slice(0, 5).map((flight) => (
                <div key={flight.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                  <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_0.9fr] items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">{flight.airline}</p>
                      <h2 className="text-xl font-semibold">{flight.origin} → {flight.destination}</h2>
                      <div className="text-sm text-muted-foreground">{flight.flightNumber} · {flight.departDate}</div>
                    </div>
                    <div><div className="font-semibold">{flight.departTime}</div><div className="text-sm text-muted-foreground">Depart</div></div>
                    <div><div className="font-semibold">{flight.arriveTime}</div><div className="text-sm text-muted-foreground">Arrive</div></div>
                    <div><div className="font-semibold">{flight.duration}</div><div className="text-sm text-muted-foreground">{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop(s)`}</div></div>
                    <div className="text-right">
                      <div className="text-3xl font-semibold">€{flight.price * passengers}</div>
                      {selectedOutbound && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Bundle total: €{(selectedOutbound.price + flight.price) * passengers}
                        </div>
                      )}
                      <button onClick={() => handleBook(flight, true)} className="btn-primary mt-3 w-full justify-center" disabled={!selectedOutbound}>
                        {bookedFlightId === flight.id ? "Booked ✓" : selectedOutbound ? "Book return bundle" : "Select outbound first"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {paymentFlight && (
        <PaymentModal
          open={!!paymentFlight}
          onClose={() => { setPaymentFlight(null); setReturnFlight(null); }}
          amount={bundledAmount}
          bookingType="flight"
          bookingDetails={returnFlight ? {
            airline: `${paymentFlight.airline} + ${returnFlight.airline}`,
            flightNumber: `${paymentFlight.flightNumber} / ${returnFlight.flightNumber}`,
            origin: paymentFlight.origin,
            destination: paymentFlight.destination,
            departDate: paymentFlight.departDate,
            departTime: paymentFlight.departTime,
            arriveTime: paymentFlight.arriveTime,
            returnDate: returnFlight.departDate,
            returnDepartTime: returnFlight.departTime,
            returnArriveTime: returnFlight.arriveTime,
            cabin: paymentFlight.cabin,
            passengers,
          } : {
            airline: paymentFlight.airline,
            flightNumber: paymentFlight.flightNumber,
            origin: paymentFlight.origin,
            destination: paymentFlight.destination,
            departDate: paymentFlight.departDate,
            departTime: paymentFlight.departTime,
            arriveTime: paymentFlight.arriveTime,
            cabin: paymentFlight.cabin,
            passengers,
          }}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
