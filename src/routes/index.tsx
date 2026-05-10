import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Calendar, Users, Star, Award, Globe, Heart, Shield, Sparkles, Phone, Plane, Building, Bed, Train } from "lucide-react";
import { packages } from "@/data/packages";
import { PackageCard } from "@/components/site/PackageCard";
import { useBookingModal } from "@/components/site/BookingModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rahi Travels — Premium Tunisia Travel Booking Platform" },
      { name: "description", content: "Discover Tunisia with curated beach, desert, heritage and wellness packages. Book flights, hotels and complete trips." },
      { property: "og:title", content: "Rahi Travels — Premium Tunisia Travel" },
      { property: "og:description", content: "Curated Tunisia tours: Sahara, Djerba, Sidi Bou Said, Carthage and more." },
    ],
  }),
  component: Home,
});

const stats = [
  { label: "Years of Experience", value: "15+" },
  { label: "Happy Travellers", value: "25,000+" },
  { label: "Destinations", value: "40+" },
  { label: "Average Rating", value: "4.9/5" },
];

const features = [
  { icon: Award, title: "Curated Locally", desc: "Hand-picked stays and guides — vetted by our Tunis team." },
  { icon: Shield, title: "Secure Booking", desc: "No prepayment required. Confirm via WhatsApp with a real agent." },
  { icon: Heart, title: "24/7 On-Trip Support", desc: "We pick up the phone — even at 3am in the Sahara." },
  { icon: Sparkles, title: "Tailor-Made Trips", desc: "Every itinerary is fully customizable to your pace and budget." },
];

const testimonials = [
  { name: "Amira K.", text: "The Sahara expedition was unreal. Camp setup, guides, food — all flawless.", role: "Solo traveller, France" },
  { name: "Marco D.", text: "Booking by WhatsApp felt personal — like having a friend in Tunis.", role: "Family of 4, Italy" },
  { name: "Sara L.", text: "Five thalasso days that genuinely reset my year. Will rebook.", role: "Wellness retreat, UK" },
];

function Home() {
  const { open } = useBookingModal();
  const domestic = packages.slice(0, 4);
  const intl = [...packages].reverse().slice(0, 4);
  const specialized = packages.filter((p) => ["Wellness", "Adventure", "Heritage", "Beach"].includes(p.category)).slice(0, 4);
const heroVideoUrl = "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4";
const heroPreviewImages = [
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">
              Powered by Rahi Group
            </span>
            <h1 className="mb-5">Tunisia, your way.<br />Booked in minutes.</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8">
              From Sahara dunes to Mediterranean beaches — premium curated packages, planned with a real agent over WhatsApp.
            </p>
          </div>

          <div className="bg-white border border-border rounded-3xl shadow-lg p-6 max-w-5xl">
            <div className="grid gap-4 md:grid-cols-4">
              <Link to="/flights" className="group rounded-3xl border border-border p-6 transition hover:border-primary hover:bg-primary/5">
                <div className="flex items-center gap-3 text-primary mb-4">
                  <Plane className="w-5 h-5" />
                  <div>
                    <div className="text-sm uppercase tracking-[0.24em]">Flights</div>
                    <div className="text-lg font-semibold">Search flight deals</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Find the best airfares with routes across Tunisia and international destinations.</p>
              </Link>
              <Link to="/hotels" className="group rounded-3xl border border-border p-6 transition hover:border-primary hover:bg-primary/5">
                <div className="flex items-center gap-3 text-primary mb-4">
                  <Bed className="w-5 h-5" />
                  <div>
                    <div className="text-sm uppercase tracking-[0.24em]">Hotels</div>
                    <div className="text-lg font-semibold">Book trusted stays</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Compare hotels, resorts and boutique riads with real traveler reviews.</p>
              </Link>
              <Link to="/trains" className="group rounded-3xl border border-border p-6 transition hover:border-primary hover:bg-primary/5">
                <div className="flex items-center gap-3 text-primary mb-4">
                  <Train className="w-5 h-5" />
                  <div>
                    <div className="text-sm uppercase tracking-[0.24em]">Trains</div>
                    <div className="text-lg font-semibold">Search rail routes</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Reserve Tunisia train travel across major cities and coastal routes.</p>
              </Link>
              <Link to="/holidays" className="group rounded-3xl border border-border p-6 transition hover:border-primary hover:bg-primary/5">
                <div className="flex items-center gap-3 text-primary mb-4">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <div className="text-sm uppercase tracking-[0.24em]">Holidays</div>
                    <div className="text-lg font-semibold">Book holiday trips</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Choose curated holidays for wellness, culture, beach and desert escapes.</p>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 pt-10 border-t">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-5 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">Premium travel media</span>
            <h2 className="mb-5">Feel the destination before you arrive.</h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              A cinematic preview, premium destination imagery and curated travel inspiration combine to make your first impression feel luxurious.
            </p>
          </div>
          <div className="grid gap-5">
            <div className="card-surface relative overflow-hidden rounded-[2rem] shadow-[0_24px_64px_rgba(40,40,40,0.08)]">
              <video
                src={heroVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover aspect-[16/9]"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="text-xs uppercase tracking-[0.24em] opacity-80 mb-2">Short film</div>
                <div className="text-xl font-semibold">Tunisia in motion</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {heroPreviewImages.map((src, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-3xl bg-white shadow-[inset_-6px_-6px_16px_rgba(255,255,255,0.85),inset_6px_6px_16px_rgba(0,0,0,0.08)]">
                  <img src={src} alt={`Travel preview ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section title="Discover Tunisia" subtitle="Domestic favourites curated by our Tunis-based team.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {domestic.map((p) => <PackageCard key={p.id} pkg={p} />)}
        </div>
      </Section>

      <Section title="International Getaways" subtitle="Add a regional escape to your Tunisia journey." muted>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {intl.map((p) => <PackageCard key={p.id} pkg={p} />)}
        </div>
      </Section>

      <Section title="Specialized Tours" subtitle="Wellness, adventure, heritage and beach — pick your vibe.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialized.map((p) => <PackageCard key={p.id} pkg={p} />)}
        </div>
      </Section>

      {/* Why */}
      <Section title="Why Rahi Travels" subtitle="A real agent, a real itinerary, a real Tunisia." muted>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-surface p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h4 className="mb-2">{f.title}</h4>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Loved by travellers" subtitle="Real notes from recent guests.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card-surface p-6">
              <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}</div>
              <p className="text-sm mb-4">"{t.text}"</p>
              <div className="text-sm font-semibold">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.role}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA Banner */}
      <section className="mx-auto max-w-7xl px-5 my-16">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 text-center">
          <Globe className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-white mb-4">Ready for Tunisia?</h2>
          <p className="opacity-90 max-w-xl mx-auto mb-6">Tell us your dates and we'll craft an itinerary in under 2 hours.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => open("Custom Trip")} className="bg-white text-primary px-6 py-2.5 rounded-lg font-semibold hover:bg-white/90 transition">Plan My Trip</button>
            <a href="tel:+21671000000" className="border border-white/30 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-white/10 transition inline-flex items-center gap-2">
              <Phone className="w-4 h-4" /> Call us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ title, subtitle, children, muted }: { title: string; subtitle?: string; children: React.ReactNode; muted?: boolean }) {
  return (
    <section className={muted ? "bg-secondary/40 py-16" : "py-16"}>
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="mb-2">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          <Link to="/packages" className="text-link text-sm hidden md:inline">View all →</Link>
        </div>
        {children}
      </div>
    </section>
  );
}

function SearchField({ icon, label, placeholder, type = "text" }: { icon: React.ReactNode; label: string; placeholder?: string; type?: string }) {
  return (
    <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary/60 transition cursor-text">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">
        <span className="block text-xs text-muted-foreground font-medium">{label}</span>
        <input type={type} placeholder={placeholder} className="w-full bg-transparent outline-none text-sm font-medium" />
      </span>
    </label>
  );
}
