import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";

const navLinks = [
  { to: "/packages", label: "Packages" },
  { to: "/packages", label: "Domestic", search: { scope: "domestic" } },
  { to: "/packages", label: "International", search: { scope: "international" } },
  { to: "/about", label: "About" },
];

const WHATSAPP = "21671000000";

export function Header() {
  const [open, setOpen] = useState(false);
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi Rahi Travels! I'd like to plan a trip.")}`;

  return (
    <header className="glass-header fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="logo-mark text-base">R</span>
          <span className="font-bold text-lg tracking-tight text-foreground">Rahi Travels</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className="nav-link" activeProps={{ style: { color: "var(--brand-primary)" } }}>Home</Link>
          <Link to="/packages" className="nav-link" activeProps={{ style: { color: "var(--brand-primary)" } }}>Packages</Link>
          <Link to="/packages" className="nav-link">Specialized Tours</Link>
          <Link to="/packages" className="nav-link">Customized Trips</Link>
          <Link to="/about" className="nav-link" activeProps={{ style: { color: "var(--brand-primary)" } }}>About</Link>
        </nav>

        <div className="flex items-center gap-2">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-primary hidden sm:inline-flex">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t bg-gradient-to-b from-white to-gray-50 shadow-lg">
          <div className="px-5 py-4 flex flex-col gap-4">
            <Link to="/" className="nav-link" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/packages" className="nav-link" onClick={() => setOpen(false)}>Packages</Link>
            <Link to="/about" className="nav-link" onClick={() => setOpen(false)}>About</Link>
            <a href={waUrl} className="btn-primary justify-center"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white mt-20 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-5 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="logo-mark">R</span>
            <span className="font-bold text-lg">Rahi Travels</span>
          </div>
          <p className="text-sm text-muted-foreground">Premium Tunisia Travel Booking Platform. Powered by Rahi Group.</p>
        </div>
        <div>
          <h5 className="font-semibold mb-4">Destinations</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Tunis & Carthage</li><li>Djerba Island</li><li>Sahara & Tozeur</li><li>Hammamet</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-4">Tours</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Beach Holidays</li><li>Desert Adventure</li><li>Heritage Trails</li><li>Wellness & Thalasso</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-4">Contact</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a className="text-link" href="tel:+21671000000">+216 71 000 000</a></li>
            <li><a className="text-link" href="https://wa.me/21671000000">WhatsApp us</a></li>
            <li>Tunis, Tunisia</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 py-6 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} Rahi Travels — A Rahi Group company</div>
    </footer>
  );
}
