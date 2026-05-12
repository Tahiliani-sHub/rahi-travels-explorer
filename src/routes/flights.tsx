import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useApp } from "@/components/site/AppProvider";
import { type Flight } from "@/data/flights";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchAutocomplete } from "@/components/site/SearchAutocomplete";
import { PaymentModal } from "@/components/site/PaymentModal";

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
  const [origin, setOrigin] = useState("TUN");
  const [destination, setDestination] = useState("DJE");
  const [departDate, setDepartDate] = useState("2026-06-08");
  const [cabin, setCabin] = useState("Any");
  const [passengers, setPassengers] = useState(1);
  const [bookedFlightId, setBookedFlightId] = useState<string | null>(null);
  const [paymentFlight, setPaymentFlight] = useState<Flight | null>(null);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedStops, setSelectedStops] = useState<number[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [durationRange, setDurationRange] = useState([0, 1440]); // in minutes
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'stops'>('price');

  const { data: results = [], isLoading } = useQuery<Flight[]>({
    queryKey: ['flights', origin, destination, departDate, cabin],
    queryFn: async () => {
      const params = new URLSearchParams({ origin, destination, departDate, cabin });
      const res = await fetch(`/api/search/flights?${params}`);
      if (!res.ok) throw new Error('Failed to fetch flights');
      return res.json();
    },
    enabled: !!origin && !!destination,
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

  const handleBook = (flight: Flight) => {
    if (!user) {
      window.location.assign("/login?next=/flights");
      return;
    }
    setPaymentFlight(flight);
  };

  const handlePaymentComplete = () => {
    if (!paymentFlight) return;
    addBooking({
      type: "flight",
      title: `${paymentFlight.airline} ${paymentFlight.flightNumber}`,
      category: `${paymentFlight.origin} → ${paymentFlight.destination}`,
      details: `${paymentFlight.departDate} • ${paymentFlight.departTime} → ${paymentFlight.arriveTime} • ${paymentFlight.cabin}`,
      price: paymentFlight.price * passengers,
      guests: passengers,
    });
    setBookedFlightId(paymentFlight.id);
    setPaymentFlight(null);
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
        <div className="grid gap-4 md:grid-cols-[1.25fr_1.25fr_1fr_1fr_1fr]">
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
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Filters Sidebar */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm h-fit">
            <h3 className="font-bold mb-4">Filters</h3>

            {/* Price Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Price (TND)</label>
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
                      <div className="text-3xl font-semibold">TND {flight.price * passengers}</div>
                      <button
                        onClick={() => handleBook(flight)}
                        className="btn-primary mt-3 w-full justify-center"
                      >
                        {bookedFlightId === flight.id ? "Booked ✓" : "Book flight"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div>{flight.cabin}</div>
                      <div>{flight.baggage} baggage</div>
                      <div>{flight.refundable ? "Refundable" : "Non-refundable"}</div>
                    </div>
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

      {paymentFlight && (
        <PaymentModal
          open={!!paymentFlight}
          onClose={() => setPaymentFlight(null)}
          amount={paymentFlight.price * passengers}
          bookingType="flight"
          bookingDetails={{
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
