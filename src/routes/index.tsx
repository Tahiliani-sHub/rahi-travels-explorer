import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Globe, Heart, Shield, Sparkles, Phone, Plane, Bed, Train, Calendar, Star, ChevronRight } from "lucide-react";
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

const HERO_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80";

const stats = [
  { label: "Years of Experience", value: "15+" },
  { label: "Happy Travellers", value: "25,000+" },
  { label: "Destinations", value: "40+" },
  { label: "Average Rating", value: "4.9★" },
];

const features = [
  { icon: Award, title: "Curated Locally", desc: "Hand-picked stays and guides — vetted by our Tunis-based team." },
  { icon: Shield, title: "Secure Booking", desc: "No hidden fees. Confirm via WhatsApp with a real human agent." },
  { icon: Heart, title: "24/7 On-Trip Support", desc: "We pick up the phone — even at 3am somewhere in the Sahara." },
  { icon: Sparkles, title: "Tailor-Made Trips", desc: "Every itinerary is fully customizable to your pace and budget." },
];

const testimonials = [
  { name: "Amira K.", text: "The Sahara expedition was unreal. Camp setup, guides, food — all flawless.", role: "Solo traveller, France" },
  { name: "Marco D.", text: "Booking by WhatsApp felt personal — like having a friend in Tunis.", role: "Family of 4, Italy" },
  { name: "Sara L.", text: "Five thalasso days that genuinely reset my year. Will rebook next season.", role: "Wellness retreat, UK" },
];

const searchLinks = [
  { to: "/flights", icon: Plane, label: "Flights", sublabel: "Search flight deals", desc: "Find the best airfares across Tunisia and international routes." },
  { to: "/hotels", icon: Bed, label: "Hotels", sublabel: "Book trusted stays", desc: "Compare hotels, resorts and boutique riads with real reviews." },
  { to: "/trains", icon: Train, label: "Trains", sublabel: "Search rail routes", desc: "Reserve Tunisia train travel across major cities and coasts." },
  { to: "/holidays", icon: Calendar, label: "Holidays", sublabel: "Curated getaways", desc: "Choose from wellness, culture, beach and desert escapes." },
] as const;

function Home() {
  const { open } = useBookingModal();
  const domestic = packages.slice(0, 4);
  const intl = [...packages].reverse().slice(0, 4);
  const specialized = packages.filter((p) => ["Wellness", "Adventure", "Heritage", "Beach"].includes(p.category)).slice(0, 4);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden flex flex-col justify-center" style={{ minHeight: '88vh' }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        {/* Gradient overlay: rich green on left, fade to transparent right */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(110deg, rgba(27,75,0,0.95) 0%, rgba(43,118,0,0.82) 40%, rgba(43,118,0,0.35) 72%, rgba(0,0,0,0.10) 100%)' }}
        />

        <div className="relative mx-auto max-w-7xl w-full px-5 py-20 lg:py-28">
          <div className="max-w-2xl">
            <span className="animate-fade-in inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              Powered by Rahi Group
            </span>

            <h1 className="animate-fade-in-up delay-100 text-white leading-tight mb-5" style={{ textShadow: '0 2px 24px rgba(0,0,0,0.35)' }}>
              Tunisia, your way.<br />Booked in minutes.
            </h1>

            <p className="animate-fade-in-up delay-200 text-lg text-white/85 max-w-xl mb-10 leading-relaxed">
              From Sahara dunes to Mediterranean beaches — premium curated packages, planned with a real agent over WhatsApp.
            </p>

            <div className="animate-fade-in-up delay-300 flex flex-wrap gap-3">
              <button
                onClick={() => open("Custom Trip")}
                className="bg-white text-green-900 font-semibold px-7 py-3.5 rounded-xl hover:bg-green-50 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Plan My Trip
              </button>
              <Link
                to="/packages"
                className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/15 hover:border-white active:scale-95 transition-all duration-200"
              >
                Browse Packages <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce-dot">
          <span className="text-white/50 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* ── FLOATING SEARCH CARD ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 -mt-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-border/40 p-6 animate-fade-in delay-400">
          <div className="grid gap-3 md:grid-cols-4">
            {searchLinks.map(({ to, icon: Icon, label, sublabel, desc }) => (
              <Link
                key={to}
                to={to}
                className="group rounded-2xl border border-border p-5 transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-2.5 text-primary mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
                    <div className="font-semibold text-sm text-foreground">{sublabel}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border/60 pt-12">
            {stats.map((s, i) => (
              <div key={s.label} className={`text-center reveal delay-${i + 1}`}>
                <div className="text-4xl font-extrabold text-primary mb-1.5 tracking-tight">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGE SECTIONS ── */}
      <Section title="Discover Tunisia" subtitle="Domestic favourites curated by our Tunis-based team.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {domestic.map((p, i) => (
            <div key={p.id} className={`reveal delay-${Math.min(i + 1, 4)}`}>
              <PackageCard pkg={p} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="International Getaways" subtitle="Add a regional escape to your Tunisia journey." muted>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {intl.map((p, i) => (
            <div key={p.id} className={`reveal delay-${Math.min(i + 1, 4)}`}>
              <PackageCard pkg={p} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Specialized Tours" subtitle="Wellness, adventure, heritage and beach — pick your vibe.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialized.map((p, i) => (
            <div key={p.id} className={`reveal delay-${Math.min(i + 1, 4)}`}>
              <PackageCard pkg={p} />
            </div>
          ))}
        </div>
      </Section>

      {/* ── WHY RAHI ── */}
      <Section title="Why Rahi Travels" subtitle="A real agent, a real itinerary, a real Tunisia." muted>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className={`card-surface p-6 reveal delay-${Math.min(i + 1, 4)}`}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h4 className="mb-2 text-lg">{f.title}</h4>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section title="Loved by travellers" subtitle="Real notes from recent guests.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={t.name} className={`card-surface p-6 reveal delay-${i + 1}`}>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-5 text-foreground">"{t.text}"</p>
              <div className="text-sm font-semibold">{t.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.role}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA BANNER ── */}
      <section className="mx-auto max-w-7xl px-5 my-16">
        <div className="reveal rounded-3xl overflow-hidden relative">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-700/80" />
          <div className="relative px-10 py-16 md:px-16 text-center">
            <Globe className="w-10 h-10 mx-auto mb-4 text-white/80" />
            <h2 className="text-white mb-4">Ready for Tunisia?</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
              Tell us your dates and we'll craft a full itinerary in under 2 hours.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => open("Custom Trip")}
                className="bg-white text-green-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-green-50 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-lg"
              >
                Plan My Trip
              </button>
              <a
                href="tel:+21671000000"
                className="border-2 border-white/40 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/15 hover:border-white transition-all duration-200 inline-flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Call us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({
  title,
  subtitle,
  children,
  muted,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section className={muted ? "bg-secondary/40 py-16" : "py-16"}>
      <div className="mx-auto max-w-7xl px-5">
        <div className="reveal flex items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="mb-2">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          <Link to="/packages" className="text-primary text-sm font-medium hover:underline hidden md:inline-flex items-center gap-1">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}
