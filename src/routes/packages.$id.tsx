import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Star, Clock, Check, X, MessageCircle, ChevronDown, Wallet, CreditCard } from "lucide-react";
import { getPackage, packages, type Package } from "@/data/packages";
import { PackageCard } from "@/components/site/PackageCard";
import { useBookingModal } from "@/components/site/BookingModal";
import { useApp } from "@/components/site/AppProvider";
import { ReviewForm } from "@/components/site/ReviewForm";
import { ReviewList } from "@/components/site/ReviewList";
import { RatingDisplay } from "@/components/site/ReviewRating";
import { PaymentModal } from "@/components/site/PaymentModal";

export const Route = createFileRoute("/packages/$id")({
  loader: ({ params }) => {
    const pkg = getPackage(params.id);
    if (!pkg) throw notFound();
    return { pkg };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.pkg.name} — Rahi Travels` },
          { name: "description", content: loaderData.pkg.tagline },
          { property: "og:title", content: `${loaderData.pkg.name} — Rahi Travels` },
          { property: "og:description", content: loaderData.pkg.tagline },
          { property: "og:image", content: loaderData.pkg.image },
        ]
      : [],
  }),
  component: PackageDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h2 className="mb-3">Package not found</h2>
      <Link to="/packages" className="text-link">Back to all packages</Link>
    </div>
  ),
});

function PackageDetail() {
  const { pkg } = Route.useLoaderData() as { pkg: Package };
  const { open } = useBookingModal();
  const { user, walletBalance, spend, addBooking } = useApp();
  const [activeImg, setActiveImg] = useState(pkg.image);
  const [activeDay, setActiveDay] = useState(1);
  const [tier, setTier] = useState(pkg.tiers[0].name);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const selectedTier = pkg.tiers.find((t) => t.name === tier)!;
  const canReserveWithWallet = walletBalance >= selectedTier.price;
  const days = checkIn && checkOut ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : pkg.nights;
  const nights = days > 0 ? days : pkg.nights;

  const handleReserveWithWallet = async () => {
    if (!user) {
      window.location.assign(`/login?next=/packages/${pkg.id}`);
      return;
    }

    if (await spend(selectedTier.price, `Reserved ${pkg.name} (${tier})`, pkg.id)) {
      addBooking({
        type: "package",
        title: pkg.name,
        category: pkg.category,
        details: `${tier} tier · ${nights} nights · ${adults + children} traveller(s)`,
        price: selectedTier.price,
        guests: adults + children,
      });
      window.alert(`Reserved ${pkg.name} using wallet credit.`);
    } else {
      window.alert("Insufficient wallet balance. Please top up your wallet to reserve this package.");
    }
  };

  const related = packages.filter((p) => p.id !== pkg.id && p.category === pkg.category).slice(0, 3);
  if (related.length < 3) related.push(...packages.filter((p) => p.id !== pkg.id && !related.includes(p)).slice(0, 3 - related.length));

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/packages" className="hover:text-primary">Packages</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground">{pkg.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <div>
          {/* Gallery */}
          <div className="rounded-2xl overflow-hidden mb-3 aspect-[16/10] bg-muted">
            <img src={activeImg} alt={pkg.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[pkg.image, ...pkg.gallery].slice(0, 4).map((g, i) => (
              <button key={i} onClick={() => setActiveImg(g)}
                className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition ${activeImg === g ? "border-primary" : "border-transparent"}`}>
                <img src={g} alt="" className="w-full h-full object-cover" />
              </button>
            )).slice(0, 4)}
          </div>

          {/* Title */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{pkg.category}</span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-4 h-4" />{pkg.duration}</span>
            <span className="flex items-center gap-1 text-sm"><Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />{pkg.rating}</span>
          </div>
          <h1 className="mb-3" style={{ fontSize: "2.5rem" }}>{pkg.name}</h1>
          <p className="text-lg text-muted-foreground mb-10">{pkg.tagline}</p>

          {/* Tiers */}
          <h3 className="mb-4">Choose your tier</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {pkg.tiers.map((t) => (
              <button key={t.name} onClick={() => setTier(t.name)}
                className={`text-left rounded-xl border-2 p-5 transition ${tier === t.name ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t.name}</div>
                <div className="text-2xl font-bold mt-1">TND {t.price.toLocaleString()}</div>
                <ul className="text-sm text-muted-foreground mt-3 space-y-1">
                  {t.perks.map((p) => <li key={p} className="flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />{p}</li>)}
                </ul>
              </button>
            ))}
          </div>

          {/* Itinerary */}
          <h3 className="mb-4">Day-by-day itinerary</h3>
          <div className="space-y-2 mb-10">
            {pkg.itinerary.map((d) => (
              <div key={d.day} className="card-surface">
                <button onClick={() => setActiveDay(activeDay === d.day ? 0 : d.day)}
                  className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">{d.day}</span>
                    <span className="font-semibold">{d.title}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition ${activeDay === d.day ? "rotate-180" : ""}`} />
                </button>
                {activeDay === d.day && (
                  <div className="px-4 pb-4 pl-16 text-sm text-muted-foreground">{d.description}</div>
                )}
              </div>
            ))}
          </div>

          {/* Inc / Exc */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="mb-3">Inclusions</h4>
              <ul className="space-y-2">
                {pkg.inclusions.map((i) => (
                  <li key={i} className="flex gap-2 text-sm"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />{i}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3">Exclusions</h4>
              <ul className="space-y-2">
                {pkg.exclusions.map((i) => (
                  <li key={i} className="flex gap-2 text-sm"><X className="w-4 h-4 text-destructive mt-0.5 shrink-0" />{i}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="card-surface p-6">
            <div className="text-xs text-muted-foreground">Starting from ({tier})</div>
            <div className="text-3xl font-bold mb-1">TND {selectedTier.price.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mb-5">per person · {pkg.nights} nights</div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Check-in</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Check-out</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <Counter label="Adults" value={adults} onChange={setAdults} min={1} />
              <Counter label="Children" value={children} onChange={setChildren} min={0} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Rooms</label>
                <input type="number" min={1} value={rooms} onChange={(e) => setRooms(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="rounded-3xl border border-gray-200 bg-slate-50 p-4">
                <div className="text-sm text-muted-foreground">Stay details</div>
                <div className="mt-2 font-semibold">{nights} nights · {adults + children} travellers</div>
                <div className="mt-1 text-sm text-muted-foreground">Rooms: {rooms}</div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!user) { window.location.assign(`/login?next=/packages/${pkg.id}`); return; }
                setPaymentOpen(true);
              }}
              className="btn-primary w-full justify-center mb-2"
            >
              <CreditCard className="w-4 h-4" /> Pay by Card
            </button>
            <button onClick={() => open(`${pkg.name} (${tier})`)} className="btn-outline w-full justify-center mb-2 text-sm">
              <MessageCircle className="w-4 h-4" /> Enquire via WhatsApp
            </button>
            <button
              onClick={handleReserveWithWallet}
              disabled={!canReserveWithWallet}
              className={`btn-outline w-full justify-center text-sm ${!canReserveWithWallet ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <Wallet className="w-4 h-4" /> Reserve with Wallet
            </button>
            <a href="tel:+21671000000" className="btn-outline w-full justify-center text-sm">Call agent</a>
          </div>
        </aside>
      </div>

      {/* Related */}
      <div className="mt-20">
        <h3 className="mb-6">You might also like</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map((p) => <PackageCard key={p.id} pkg={p} />)}
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={selectedTier.price}
        bookingType="package"
        bookingDetails={{
          packageId: pkg.id,
          name: pkg.name,
          tier,
          nights,
          adults,
          children,
          checkIn,
          checkOut,
          rooms,
        }}
        onComplete={() => {
          addBooking({
            type: "package",
            title: pkg.name,
            category: pkg.category,
            details: `${tier} tier · ${nights} nights · ${adults + children} traveller(s)`,
            price: selectedTier.price,
            guests: adults + children,
          });
          setPaymentOpen(false);
        }}
      />

      {/* Reviews Section */}
      <div className="mt-20">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-bold">Guest Reviews</h2>
          <RatingDisplay itemId={pkg.id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ReviewList itemId={pkg.id} currentUserId={user?.id} />
          </div>
          <div>
            <ReviewForm 
              itemId={pkg.id} 
              itemType="package"
              userId={user?.id}
              userName={user?.name}
              onReviewSubmitted={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Counter({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="flex items-center border border-border rounded-lg">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="px-3 py-2 hover:bg-muted">−</button>
        <span className="flex-1 text-center text-sm font-semibold">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="px-3 py-2 hover:bg-muted">+</button>
      </div>
    </div>
  );
}
