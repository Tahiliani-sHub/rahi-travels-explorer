import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/components/site/AppProvider";
import { type Hotel } from "@/data/hotels";

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
  const roomLabel = `${rooms.length} chambre${rooms.length > 1 ? "s" : ""}`;
  const adultLabel = `${adults} adulte${adults > 1 ? "s" : ""}`;
  const childLabel = `${children} enfant${children > 1 ? "s" : ""}`;
  return `${roomLabel}: ${adultLabel} et ${childLabel}`;
}

function diffDays(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const diff = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
  return diff || 1;
}

function HotelsPage() {
  const { user, addBooking } = useApp();
  const [city, setCity] = useState("Hammamet");
  const [checkIn, setCheckIn] = useState("2026-06-01");
  const [checkOut, setCheckOut] = useState("2026-06-06");
  const [occupancyRooms, setOccupancyRooms] = useState<OccupancyRoom[]>([{ adults: 2, children: 0 }]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
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

  const { data: allResults = [], isLoading } = useQuery({
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

    addBooking({
      type: "hotel",
      title: hotel.name,
      category: hotel.city,
      details: `${hotel.location} • ${rooms} chambre${rooms > 1 ? "s" : ""} · ${guests} voyageur${guests > 1 ? "s" : ""}`,
      price: hotel.price * nights * rooms,
      guests,
    });
    setSelectedHotelId(hotel.id);
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
            <h1 className="text-3xl font-semibold">Recherche d'hôtels</h1>
            <p className="text-muted-foreground mt-2">Réservez des séjours avec nuits, chambres et filtres comme sur TunisiaBeds.</p>
          </div>
          <Link to="/packages" className="btn-outline">Voir les packages</Link>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm mb-8">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_0.9fr] items-end">
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Destination</span>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Hammamet"
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Arrivée</span>
            <input
              type="date"
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Départ</span>
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
            <div className="text-muted-foreground text-xs">Chambres</div>
            <div className="font-semibold">{formatGuests(occupancyRooms)}</div>
          </button>
          <div className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
            <div className="text-muted-foreground">Nuits</div>
            <div className="mt-1 text-lg font-semibold">{nights}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Filtres</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <div className="text-sm font-semibold mb-2">Sélection rapide</div>
                <div className="space-y-2">
                  {[
                    { key: "recommended", label: "Hôtel recommandé" },
                    { key: "promotion", label: "Tarif promo" },
                    { key: "childFriendly", label: "Enfant gratuit" },
                    { key: "availableOnly", label: "Disponibilité" },
                    { key: "refundable", label: "Annulation gratuite" },
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
                <div className="text-sm font-semibold mb-2">Étoiles</div>
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
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Searching hotels...' : `${results.length} hôtels disponibles trouvés à ${city} du ${checkIn} au ${checkOut} pour ${rooms} chambre${rooms > 1 ? "s" : ""}: ${formatGuests(occupancyRooms)}`}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-10">Loading hotels...</div>
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
                      {hotel.promotion && <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">Promo</span>}
                      {hotel.refundable && <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs">Annulation gratuite</span>}
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
                    <div className="text-sm text-muted-foreground">Note</div>
                    <div className="text-2xl font-semibold">{hotel.rating.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">{hotel.stars} étoiles</div>
                    <div className="mt-3 text-sm text-muted-foreground">{hotel.roomsAvailable} chambres disponibles</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Prix pour {nights} nuit{nights > 1 ? "s" : ""}</div>
                    <div className="text-3xl font-semibold">TND {hotel.price * nights * rooms}</div>
                    <button
                      onClick={() => handleBookHotel(hotel)}
                      className="btn-primary mt-4 w-full justify-center"
                    >
                      {selectedHotelId === hotel.id ? "Réservé" : "Tarifs & Chambres"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </section>
      </div>

      {occupancyOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Chambres et occupations</h2>
                <p className="text-sm text-muted-foreground">Ajoutez des chambres ou mettez à jour le nombre d'adultes et d'enfants.</p>
              </div>
              <button onClick={() => setOccupancyOpen(false)} className="text-slate-500 hover:text-slate-900">Fermer</button>
            </div>
            <div className="space-y-6">
              {occupancyRooms.map((room, index) => (
                <div key={index} className="rounded-2xl border border-border p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="font-semibold">Chambre {index + 1}</div>
                    {occupancyRooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setOccupancyRooms((prev) => prev.filter((_, idx) => idx !== index))}
                        className="text-sm text-destructive hover:underline"
                      >Supprimer</button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-muted-foreground">Adultes</span>
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
                      <span className="text-sm font-medium text-muted-foreground">Enfants</span>
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
                <button type="button" onClick={addRoom} className="btn-outline">+ Ajouter une chambre</button>
                <button type="button" onClick={() => setOccupancyOpen(false)} className="btn-primary">Demander</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
