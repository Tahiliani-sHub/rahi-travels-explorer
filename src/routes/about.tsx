import { createFileRoute } from "@tanstack/react-router";
import { Phone, Award, Shield, Heart, Sparkles, MapPin } from "lucide-react";
import { useBookingModal } from "@/components/site/BookingModal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Rahi Travels — A Rahi Group Company" },
      { name: "description", content: "Rahi Travels is the Tunisia branch of Rahi Group, a premium travel platform with 15+ years of experience." },
      { property: "og:title", content: "About Rahi Travels" },
      { property: "og:description", content: "Tunisia, curated by locals. A Rahi Group company." },
    ],
  }),
  component: About,
});

const team = [
  { name: "Yasmine Ben Salah", role: "Head of Operations, Tunis", phone: "+216 71 000 001", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { name: "Karim Trabelsi", role: "Senior Travel Designer", phone: "+216 71 000 002", img: "https://images.unsplash.com/photo-1541745537419-a6a79b9b5bfa?auto=format&fit=crop&w=400&q=80" },
  { name: "Lina Mansouri", role: "Wellness & Retreats Lead", phone: "+216 71 000 003", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80" },
];

const values = [
  { icon: Award, title: "Local expertise", desc: "Born and raised in Tunisia. We know every dune and dar." },
  { icon: Shield, title: "Honest pricing", desc: "Tiered, transparent, no hidden fees — and no prepayment to enquire." },
  { icon: Heart, title: "Human service", desc: "A real agent on WhatsApp from first message to safe return home." },
  { icon: Sparkles, title: "Curated quality", desc: "Every hotel, guide and driver is personally vetted." },
];

const stats = [
  { v: "15+", l: "Years of Experience" },
  { v: "25K+", l: "Happy Travellers" },
  { v: "40+", l: "Destinations" },
  { v: "4.9/5", l: "Average Rating" },
];

function About() {
  const { open } = useBookingModal();
  return (
    <>
      {/* Hero */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">A Rahi Group company</span>
            <h1 className="mb-5">Tunisia, curated by people who live here.</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Rahi Travels is the Tunisia branch of Rahi Group — a premium travel platform built on one belief: a great trip starts with a great human on the other side of the chat.
            </p>
            <button onClick={() => open("Custom Trip")} className="btn-primary">Plan my trip</button>
          </div>
          <div className="rounded-[2rem] overflow-hidden shadow-[0_24px_64px_rgba(40,40,40,0.08)]">
            <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" alt="Our team" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h2 className="mb-6">Our story</h2>
        <p className="text-muted-foreground mb-4">
          Rahi Group started 15 years ago with a simple promise: travel that feels personal again. Our Tunisia office opened to bring this promise home — to the country we love most.
        </p>
        <p className="text-muted-foreground">
          Today we host over 25,000 guests a year across the Sahara, Djerba, Sidi Bou Said, Hammamet and beyond — all booked the way we'd book for our own family: by talking to a real person.
        </p>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="mx-auto max-w-7xl px-5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.l}>
              <div className="text-4xl font-bold">{s.v}</div>
              <div className="text-sm opacity-80 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="text-center mb-10">
          <h2 className="mb-3">What we stand for</h2>
          <p className="text-muted-foreground">Four values, every trip.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.title} className="card-surface p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <v.icon className="w-5 h-5" />
              </div>
              <h4 className="mb-2">{v.title}</h4>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center mb-10">
            <h2 className="mb-3">Meet your travel agents</h2>
            <p className="text-muted-foreground">Real people, on WhatsApp, in your timezone.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((t) => (
              <div key={t.name} className="card-surface overflow-hidden">
                <div className="aspect-[4/3]"><img src={t.img} alt={t.name} className="w-full h-full object-cover" /></div>
                <div className="p-5">
                  <h4 className="mb-1">{t.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{t.role}</p>
                  <a href={`tel:${t.phone.replace(/\s/g, "")}`} className="text-link text-sm flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {t.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="text-center mb-10">
          <h2 className="mb-3">Trust & certifications</h2>
          <p className="text-muted-foreground">Officially recognised, audited and insured.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["IATA Member", "Tunisian Tourism Board", "ISO 9001 Certified", "Rahi Group Verified"].map((b) => (
            <div key={b} className="card-surface p-6 text-center text-sm font-semibold">{b}</div>
          ))}
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="card-surface overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-10">
              <h3 className="mb-3">Visit our Tunis office</h3>
              <p className="text-muted-foreground mb-6">Avenue Habib Bourguiba, Tunis — Tunisia. Walk-ins welcome 9am–6pm.</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Avenue Habib Bourguiba, Tunis</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> <a href="tel:+21671000000" className="text-link">+216 71 000 000</a></div>
              </div>
            </div>
            <div className="aspect-[4/3] md:aspect-auto bg-muted">
              <iframe
                title="Tunis office map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=10.16%2C36.79%2C10.21%2C36.82&layer=mapnik&marker=36.8065%2C10.1815"
                className="w-full h-full border-0 min-h-[300px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
