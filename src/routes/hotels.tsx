import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useApp } from "@/components/site/AppProvider";
import { SearchAutocomplete } from "@/components/site/SearchAutocomplete";
import { type Hotel } from "@/data/hotels";
import { PaymentModal } from "@/components/site/PaymentModal";
import { RatingDisplay } from "@/components/site/ReviewRating";

export const Route = createFileRoute("/hotels")({
  head: () => ({
    meta: [
      { title: "Search hotels — Rahi Travels" },
      { name: "description", content: "Search hotel stays with ratings, amenities, and flexible booking." },
    ],
  }),
  component: HotelsPage,
});

type OccupancyRoom = {
  adults: number;
  children: number;
};

function formatGuests(rooms: OccupancyRoom[]) {
  const adults = rooms.reduce((sum, room) => sum + room.adults, 0);
  const children = rooms.reduce((sum, room) => sum + room.children, 0);
  const roomLabel = `${rooms.length} room${rooms.length > 1 ? "s" : ""}`;
  const adultLabel = `${adults} adult${adults > 1 ? "s" : ""}`;
  const childLabel = `${children} child${children > 1 ? "ren" : ""}`;
  return `${roomLabel}: ${adultLabel}, ${childLabel}`;
}

function diffDays(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diff = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
  return diff || 1;
}

function HotelsPage() {
  const { user, addBooking, toggleSavedItem, isSavedItem } = useApp();
  const [city, setCity] = useState("Hammamet");
  const [checkIn, setCheckIn] = useState("2026-06-01");
  const [checkOut, setCheckOut] = useState("2026-06-06");
  const [occupancyRooms, setOccupancyRooms] = useState<OccupancyRoom[]>([{ adults: 2, children: 0 }]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [paymentHotel, setPaymentHotel] = useState<Hotel | null>(null);
  const [filters, setFilters] = useState({
    recommended: false,
    promotion: false,
    childFriendly: false,
    availableOnly: true,
    refundable: false,
  });
  const [rating, setRating] = useState<number | null>(null);
  const [occupancyOpen, setOccupancyOpen] = useState(false);

  const guests = occupancyRooms.reduce((sum, room) => sum + room.adults + room.children, 0);
  const nights = diffDays(checkIn, checkOut);
  const rooms = occupancyRooms.length;

  const { data: allResults = [], isLoading } = useQuery<Hotel[]>({
    queryKey: ['hotels', city, checkIn, checkOut, guests],
    queryFn: async () => {
      const params = new URLSearchParams({ city, checkIn, checkOut, guests: guests.toString() });
      const res = await fetch(`/api/search/hotels?${params}`);
      if (!res.ok) throw new Error('Failed to fetch hotels');
      return res.json();
    },
    enabled: !!city,
  });

  const results = useMemo(() => {
    return allResults.filter((hotel: Hotel) => {
      const matchesRecommended = !filters.recommended || hotel.rating >= 4.7;
      const matchesPromotion = !filters.promotion || hotel.promotion;
      const matchesChildFriendly = !filters.childFriendly || hotel.childFriendly;
      const matchesAvailable = !filters.availableOnly || hotel.roomsAvailable > 0;
      const matchesRefundable = !filters.refundable || hotel.refundable;
      const matchesRating = rating === null || hotel.rating >= rating;
      return matchesRecommended && matchesPromotion && matchesChildFriendly && matchesAvailable && matchesRefundable && matchesRating;
    });
  }, [allResults, filters, rating]);

  const handleBookHotel = (hotel: Hotel) => {
    if (!user) {
      window.location.assign("/login?next=/hotels");
      return;
    }
    setPaymentHotel(hotel);
  };

  const handlePaymentComplete = () => {
    if (!paymentHotel) return;
    addBooking({
      type: "hotel",
      title: paymentHotel.name,
      category: paymentHotel.city,
      details: `${paymentHotel.location} • ${rooms} room${rooms > 1 ? "s" : ""} · ${guests} guest${guests > 1 ? "s" : ""}`,
      price: paymentHotel.price * nights * rooms,
      guests,
    });
    setSelectedHotelId(paymentHotel.id);
    setPaymentHotel(null);
  };

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateRoom = (index: number, changes: Partial<OccupancyRoom>) => {
    setOccupancyRooms((prev) => prev.map((room, idx) => (idx === index ? { ...room, ...changes } : room)));
  };

  const addRoom = () => {
    setOccupancyRooms((prev) => [...prev, { adults: 2, children: 0 }]);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
      <div className="mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Search hotels</h1>
            <p className="text-muted-foreground mt-2">Compare hotels and book with flexible room options, filters, and real guest ratings.</p>
          </div>
          <Link to="/packages" className="btn-outline">View packages</Link>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm mb-8">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_0.9fr] items-end">
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Destination</span>
            <div className="mt-2">
              <SearchAutocomplete
                value={city}
                onChange={setCity}
                placeholder="Hammamet"
                type="hotel"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Check-in</span>
            <input
              type="date"
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Check-out</span>
            <input
              type="date"
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button
            type="button"
            onClick={() => setOccupancyOpen(true)}
            className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-left text-sm text-foreground hover:border-primary hover:bg-primary/5"
          >
            <div className="text-muted-foreground text-xs">Rooms & guests</div>
            <div className="font-semibold">{formatGuests(occupancyRooms)}</div>
          </button>
          <div className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
            <div className="text-muted-foreground">Nights</div>
            <div className="mt-1 text-lg font-semibold">{nights}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <div className="text-sm font-semibold mb-2">Quick filters</div>
                <div className="space-y-2">
                  {[
                    { key: "recommended", label: "Recommended" },
                    { key: "promotion", label: "On promotion" },
                    { key: "childFriendly", label: "Child-friendly" },
                    { key: "availableOnly", label: "Available only" },
                    { key: "refundable", label: "Free cancellation" },
                  ].map((option) => (
                    <label key={option.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters[option.key as keyof typeof filters]}
                        onChange={() => toggleFilter(option.key as keyof typeof filters)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Star rating</div>
                <div className="space-y-2">
                  {[5, 4, 3].map((stars) => (
                    <label key={stars} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="hotel-rating"
                        checked={rating === stars}
                        onChange={() => setRating(rating === stars ? null : stars)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>{"★".repeat(stars)}{stars === 5 ? "+" : ""}</span>
                    </label>
                  ))}
                </div>
                <button type="button" onClick={() => setRating(null)} className="mt-3 text-primary text-sm hover:underline">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Searching hotels...' : `${results.length} hotel${results.length !== 1 ? "s" : ""} found in ${city} · ${checkIn} to ${checkOut} · ${formatGuests(occupancyRooms)}`}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                  <div className="grid gap-4 lg:grid-cols-[220px_1fr_0.85fr_0.9fr] items-start">
                    <div className="skeleton aspect-[4/3] rounded-2xl" />
                    <div className="space-y-3 pt-1">
                      <div className="flex gap-2"><div className="skeleton h-5 w-20 rounded-full" /><div className="skeleton h-5 w-16 rounded-full" /></div>
                      <div className="skeleton h-6 w-48" />
                      <div className="skeleton h-4 w-32" />
                      <div className="flex gap-2 flex-wrap mt-3">{Array.from({length:4}).map((_,j)=><div key={j} className="skeleton h-5 w-16 rounded-full" />)}</div>
                    </div>
                    <div className="space-y-2"><div className="skeleton h-5 w-20" /><div className="skeleton h-4 w-24" /></div>
                    <div className="space-y-3 text-right"><div className="skeleton h-4 w-28 ml-auto" /><div className="skeleton h-8 w-20 ml-auto" /><div className="skeleton h-10 w-full rounded-xl" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {results.map((hotel) => (
              <div key={hotel.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-[220px_1fr_0.85fr_0.9fr] items-start">
                  <div className="overflow-hidden rounded-3xl bg-slate-100">
                    <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{hotel.boardType}</span>
                      {hotel.promotion && <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">On sale</span>}
                      {hotel.refundable && <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs">Free cancellation</span>}
                    </div>
                    <h2 className="text-xl font-semibold">{hotel.name}</h2>
                    <div className="text-sm text-muted-foreground mt-2">{hotel.location}, {hotel.city}</div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {hotel.amenities.map((amenity) => (
                        <span key={amenity} className="rounded-full border border-border bg-slate-50 px-3 py-1">{amenity}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Rating</div>
                    <div className="text-2xl font-semibold">{hotel.rating.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">{hotel.stars} stars</div>
                    <div className="mt-2">
                      <RatingDisplay itemId={hotel.id} />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{hotel.roomsAvailable} rooms available</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Price for {nights} night{nights > 1 ? "s" : ""}</div>
                    <div className="text-3xl font-semibold">TND {hotel.price * nights * rooms}</div>
                    <button
                      onClick={() => handleBookHotel(hotel)}
                      className="btn-primary mt-4 w-full justify-center"
                    >
                      {selectedHotelId === hotel.id ? "Booked ✓" : "Select room"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) { window.location.assign("/login?next=/hotels"); return; }
                        toggleSavedItem({
                          id: hotel.id,
                          type: "hotel",
                          title: hotel.name,
                          subtitle: `${hotel.city} · ${hotel.stars} stars`,
                          price: hotel.price * nights * rooms,
                          savedAt: new Date().toISOString(),
                          meta: { ...hotel, nights, rooms } as Record<string, unknown>
                        });
                      }}
                      className={`mt-2 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition w-full justify-center ${isSavedItem(hotel.id) ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-muted-foreground hover:border-primary"}`}
                    >
                      <Heart className="w-3.5 h-3.5" /> {isSavedItem(hotel.id) ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </section>
      </div>

      {paymentHotel && (
        <PaymentModal
          open={!!paymentHotel}
          onClose={() => setPaymentHotel(null)}
          amount={paymentHotel.price * nights * rooms}
          bookingType="hotel"
          bookingDetails={{
            hotel: paymentHotel.name,
            city: paymentHotel.city,
            checkIn,
            checkOut,
            nights,
            rooms,
            guests,
            boardType: paymentHotel.boardType,
          }}
          onComplete={handlePaymentComplete}
        />
      )}

      {occupancyOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Rooms & guests</h2>
                <p className="text-sm text-muted-foreground">Add rooms or update the number of adults and children.</p>
              </div>
              <button onClick={() => setOccupancyOpen(false)} className="text-slate-500 hover:text-slate-900">Close</button>
            </div>
            <div className="space-y-6">
              {occupancyRooms.map((room, index) => (
                <div key={index} className="rounded-2xl border border-border p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="font-semibold">Room {index + 1}</div>
                    {occupancyRooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setOccupancyRooms((prev) => prev.filter((_, idx) => idx !== index))}
                        className="text-sm text-destructive hover:underline"
                      >Remove</button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-muted-foreground">Adults</span>
                      <select
                        value={room.adults}
                        onChange={(event) => updateRoom(index, { adults: Number(event.target.value) })}
                        className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {[1, 2, 3, 4].map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-muted-foreground">Children</span>
                      <select
                        value={room.children}
                        onChange={(event) => updateRoom(index, { children: Number(event.target.value) })}
                        className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {[0, 1, 2, 3].map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={addRoom} className="btn-outline">+ Add room</button>
                <button type="button" onClick={() => setOccupancyOpen(false)} className="btn-primary">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
