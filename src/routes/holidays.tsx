import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useApp } from "@/components/site/AppProvider";
import { SearchAutocomplete } from "@/components/site/SearchAutocomplete";
import { type Holiday } from "@/data/holidays";
import { PaymentModal } from "@/components/site/PaymentModal";

export const Route = createFileRoute("/holidays")({
  head: () => ({
    meta: [
      { title: "Holiday packages — Rahi Travels" },
      { name: "description", content: "Browse holiday trips and book curated stays with local guides." },
    ],
  }),
  component: HolidaysPage,
});

function HolidaysPage() {
  const { user, addBooking, toggleSavedItem, isSavedItem } = useApp();
  const [destination, setDestination] = useState("Hammamet");
  const [date, setDate] = useState("2026-06-15");
  const [guests, setGuests] = useState(2);
  const [selectedHolidayId, setSelectedHolidayId] = useState<string | null>(null);
  const [paymentHoliday, setPaymentHoliday] = useState<Holiday | null>(null);

  const { data: results = [], isLoading } = useQuery<Holiday[]>({
    queryKey: ['holidays', destination, date, guests],
    queryFn: async () => {
      const params = new URLSearchParams({ destination, date, guests: guests.toString() });
      const res = await fetch(`/api/search/holidays?${params}`);
      if (!res.ok) throw new Error('Failed to fetch holidays');
      return res.json();
    },
    enabled: !!destination,
  });

  const handleBook = (holiday: Holiday) => {
    if (!user) {
      window.location.assign("/login?next=/holidays");
      return;
    }
    setPaymentHoliday(holiday);
  };

  const handlePaymentComplete = () => {
    if (!paymentHoliday) return;
    addBooking({
      type: "holiday",
      title: paymentHoliday.name,
      category: paymentHoliday.category,
      details: `${paymentHoliday.destination} · ${paymentHoliday.nights} nights · ${guests} guest(s)`,
      price: paymentHoliday.price * guests,
      guests,
    });
    setSelectedHolidayId(paymentHoliday.id);
    setPaymentHoliday(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
      <div className="mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Explore holiday trips</h1>
            <p className="text-muted-foreground mt-2">Choose curated holiday experiences and book with a trusted local agency.</p>
          </div>
          <Link to="/trains" className="btn-outline">Search trains</Link>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm mb-10">
        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Destination</span>
            <div className="mt-2">
              <SearchAutocomplete
                value={destination}
                onChange={setDestination}
                placeholder="Hammamet"
                type="holiday"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Start date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Guests</span>
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(event) => setGuests(Math.max(1, Number(event.target.value)))}
              className="mt-2 w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-muted-foreground">Searching holidays...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-3xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No holiday trips are available for this search. Try a different destination or date.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {results.map((holiday) => (
            <div key={holiday.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[220px_1fr_0.9fr_0.9fr] items-start">
                <div className="overflow-hidden rounded-3xl bg-slate-100">
                  <img src={holiday.image} alt={holiday.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{holiday.name}</h2>
                  <p className="text-sm text-muted-foreground mt-2">{holiday.tagline}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {holiday.highlights.map((highlight) => (
                      <span key={highlight} className="rounded-full border border-border bg-slate-50 px-3 py-1">{highlight}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Rating</div>
                  <div className="text-2xl font-semibold">{holiday.rating.toFixed(1)}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold">TND {holiday.price * guests}</div>
                  <button
                    onClick={() => handleBook(holiday)}
                    className="btn-primary mt-3 w-full justify-center"
                  >
                    {selectedHolidayId === holiday.id ? "Booked ✓" : "Book holiday"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) { window.location.assign("/login?next=/holidays"); return; }
                      toggleSavedItem({
                        id: holiday.id,
                        type: "holiday",
                        title: holiday.name,
                        subtitle: `${holiday.destination} · ${holiday.nights} nights`,
                        price: holiday.price * guests,
                        savedAt: new Date().toISOString(),
                        meta: { ...holiday, guests } as Record<string, unknown>
                      });
                    }}
                    className={`mt-2 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition w-full justify-center ${isSavedItem(holiday.id) ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-muted-foreground hover:border-primary"}`}
                  >
                    <Heart className="w-3.5 h-3.5" /> {isSavedItem(holiday.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {paymentHoliday && (
        <PaymentModal
          open={!!paymentHoliday}
          onClose={() => setPaymentHoliday(null)}
          amount={paymentHoliday.price * guests}
          bookingType="holiday"
          bookingDetails={{
            name: paymentHoliday.name,
            destination: paymentHoliday.destination,
            category: paymentHoliday.category,
            nights: paymentHoliday.nights,
            date,
            guests,
          }}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
