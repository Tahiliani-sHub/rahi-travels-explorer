import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, MessageCircle, Wallet, Sparkles } from "lucide-react";
import { useApp } from "./AppProvider";
import { WalletDrawer } from "./WalletDrawer";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const { user, logout, walletBalance, savedPackageIds, comparePackageIds, savedItems } = useApp();
  const waUrl = `https://wa.me/21671000000?text=${encodeURIComponent("Hi Rahi Travels! I'd like to plan a trip.")}`;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 bg-white/90 border-b border-gray-200 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            {user ? (
              <span>Bienvenue {user.name}</span>
            ) : (
              <span>Explore travel services in Tunisia</span>
            )}
            <span className="hidden sm:inline">Devise (DT)</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>Montant disponible {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} DT</span>
            <a href="tel:+21671000000" className="text-primary hover:underline">+216 71 000 000</a>
            <Link to="/account" className="hidden sm:inline text-muted-foreground hover:text-primary">Votre espace</Link>
          </div>
        </div>
      </div>
      <header className="glass-header fixed top-12 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="logo-mark text-base">R</span>
            <span className="font-bold text-lg tracking-tight text-foreground">Rahi Travels</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="nav-link" activeProps={{ style: { color: "var(--brand-primary)" } }}>Home</Link>
            <Link to="/flights" className="nav-link" activeProps={{ style: { color: "var(--brand-primary)" } }}>Flights</Link>
            <Link to="/hotels" className="nav-link" activeProps={{ style: { color: "var(--brand-primary)" } }}>Hotels</Link>
            <Link to="/trains" className="nav-link" activeProps={{ style: { color: "var(--brand-primary)" } }}>Trains</Link>
            <Link to="/holidays" className="nav-link" activeProps={{ style: { color: "var(--brand-primary)" } }}>Holidays</Link>
            <Link to="/packages" className="nav-link" activeProps={{ style: { color: "var(--brand-primary)" } }}>Packages</Link>
            <Link to="/compare" className="nav-link">Compare</Link>
            <Link to="/saved" className="nav-link">Saved</Link>
            <Link to="/bookings" className="nav-link">Bookings</Link>
            <Link to="/about" className="nav-link">About</Link>
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" className="btn-outline hidden sm:inline-flex items-center gap-2" onClick={() => setWalletOpen(true)}>
              <Wallet className="w-4 h-4" />
              Wallet TND {walletBalance.toLocaleString()}
            </button>
            {user ? (
              <>
                <Link to="/account" className="btn-outline hidden sm:inline-flex">{user.name}</Link>
                <button onClick={logout} className="btn-outline hidden sm:inline-flex">Sign out</button>
              </>
            ) : (
              <Link to="/login" className="btn-outline hidden sm:inline-flex">Sign in</Link>
            )}
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-primary hidden sm:inline-flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t bg-gradient-to-b from-white to-gray-50 shadow-lg">
            <div className="px-5 py-4 flex flex-col gap-4">
              <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/flights" className="nav-link" onClick={() => setMenuOpen(false)}>Flights</Link>
              <Link to="/hotels" className="nav-link" onClick={() => setMenuOpen(false)}>Hotels</Link>
              <Link to="/trains" className="nav-link" onClick={() => setMenuOpen(false)}>Trains</Link>
              <Link to="/holidays" className="nav-link" onClick={() => setMenuOpen(false)}>Holidays</Link>
              <Link to="/packages" className="nav-link" onClick={() => setMenuOpen(false)}>Packages</Link>
              <Link to="/compare" className="nav-link" onClick={() => setMenuOpen(false)}>Compare</Link>
              <Link to="/saved" className="nav-link" onClick={() => setMenuOpen(false)}>Saved</Link>
              <Link to="/bookings" className="nav-link" onClick={() => setMenuOpen(false)}>Bookings</Link>
              <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
              {user ? (
                <>
                  <Link to="/account" className="btn-outline justify-center">My account</Link>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="btn-outline justify-center">Sign out</button>
                </>
              ) : (
                <Link to="/login" className="btn-outline justify-center">Sign in</Link>
              )}
              <button type="button" onClick={() => { setWalletOpen(true); setMenuOpen(false); }} className="btn-outline justify-center items-center gap-2"><Wallet className="w-4 h-4" /> Wallet</button>
              <a href={waUrl} className="btn-primary justify-center items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
            </div>
          </div>
        )}
      </header>

      <div className="mt-16 bg-gradient-to-b from-slate-100 via-white to-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-5 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" /> Trusted marketplace features with secure bookings.
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Link
              to="/saved"
              className="rounded-full bg-slate-100 px-3 py-1 hover:bg-primary/10 hover:text-primary transition"
            >
              Saved {savedPackageIds.length + savedItems.length}
            </Link>
            <Link
              to="/compare"
              className="rounded-full bg-slate-100 px-3 py-1 hover:bg-primary/10 hover:text-primary transition"
            >
              Compare {comparePackageIds.length}
            </Link>
          </div>
        </div>
      </div>

      <WalletDrawer open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
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
