import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, MessageCircle, Wallet, Sparkles } from "lucide-react";
import { useApp } from "./AppProvider";
import { WalletDrawer } from "./WalletDrawer";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, walletBalance, savedPackageIds, comparePackageIds, savedItems } = useApp();
  const routerState = useRouterState();
  const waUrl = `https://wa.me/21671000000?text=${encodeURIComponent("Hi Rahi Travels! I'd like to plan a trip.")}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [routerState.location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/flights', label: 'Flights' },
    { to: '/hotels', label: 'Hotels' },
    { to: '/trains', label: 'Trains' },
    { to: '/holidays', label: 'Holidays' },
    { to: '/packages', label: 'Packages' },
    { to: '/compare', label: 'Compare' },
    { to: '/saved', label: 'Saved' },
    { to: '/bookings', label: 'Bookings' },
    { to: '/about', label: 'About' },
  ] as const;

  return (
    <>
      {/* Top info bar */}
      <div className="fixed inset-x-0 top-0 z-50 bg-white/95 border-b border-gray-200 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-5 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            {user ? (
              <span>Welcome back, <strong className="text-foreground">{user.name}</strong></span>
            ) : (
              <span>Premium travel services across Tunisia</span>
            )}
            <span className="hidden sm:inline text-xs text-muted-foreground">Currency: EUR</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="tabular-nums">Balance: €{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <a href="tel:+21671000000" className="text-primary hover:underline font-medium">+216 71 000 000</a>
            <Link to="/account" className="hidden sm:inline text-muted-foreground hover:text-primary transition-colors">My Account</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`glass-header fixed top-10 left-0 right-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}
      >
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="logo-mark text-base">R</span>
            <span className="font-bold text-lg tracking-tight text-foreground">Rahi Travels</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="nav-link"
                activeProps={{ style: { color: 'var(--brand-primary)', fontWeight: '600' } }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="btn-outline hidden sm:inline-flex items-center gap-2 text-sm px-3 py-2"
              onClick={() => setWalletOpen(true)}
            >
              <Wallet className="w-4 h-4" />
              €{walletBalance.toLocaleString()}
            </button>
            {user ? (
              <>
                <Link to="/account" className="btn-outline hidden sm:inline-flex text-sm px-3 py-2">{user.name.split(' ')[0]}</Link>
                <button onClick={logout} className="btn-outline hidden sm:inline-flex text-sm px-3 py-2">Sign out</button>
              </>
            ) : (
              <Link to="/login" className="btn-outline hidden sm:inline-flex text-sm px-3 py-2">Sign in</Link>
            )}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary hidden sm:inline-flex items-center gap-2 text-sm px-3 py-2"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-secondary/60 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${menuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
                >
                  <X className="w-5 h-5" />
                </span>
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${menuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}
                >
                  <Menu className="w-5 h-5" />
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t bg-white/98 backdrop-blur-sm shadow-xl animate-slide-down">
            <div className="px-5 py-5 flex flex-col gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="nav-link py-2.5 px-3 rounded-xl hover:bg-secondary/60 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="border-t mt-3 pt-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/account" className="btn-outline justify-center">My account</Link>
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="btn-outline justify-center">Sign out</button>
                  </>
                ) : (
                  <Link to="/login" className="btn-outline justify-center">Sign in</Link>
                )}
                <button
                  type="button"
                  onClick={() => { setWalletOpen(true); setMenuOpen(false); }}
                  className="btn-outline justify-center items-center gap-2"
                >
                  <Wallet className="w-4 h-4" /> Wallet · €{walletBalance.toLocaleString()}
                </button>
                <a href={waUrl} className="btn-primary justify-center items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> WhatsApp us
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Secondary trust bar */}
      <div className="mt-10 bg-gradient-to-b from-slate-100 via-white to-white border-b border-gray-200" style={{ marginTop: '104px' }}>
        <div className="mx-auto max-w-7xl px-5 py-2.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Trusted marketplace — secure bookings, real local guides.</span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/saved"
              className="rounded-full bg-slate-100 px-3 py-1 hover:bg-primary/10 hover:text-primary transition-colors font-medium"
            >
              Saved {savedPackageIds.length + savedItems.length > 0 ? `· ${savedPackageIds.length + savedItems.length}` : ''}
            </Link>
            <Link
              to="/compare"
              className="rounded-full bg-slate-100 px-3 py-1 hover:bg-primary/10 hover:text-primary transition-colors font-medium"
            >
              Compare {comparePackageIds.length > 0 ? `· ${comparePackageIds.length}` : ''}
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
          <p className="text-sm text-muted-foreground leading-relaxed">
            Premium Tunisia travel, curated by locals. Part of the Rahi Group.
          </p>
        </div>
        <div>
          <h5 className="font-semibold mb-4">Destinations</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="hover:text-primary transition-colors cursor-pointer">Tunis &amp; Carthage</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Djerba Island</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Sahara &amp; Tozeur</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Hammamet</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-4">Tours</h5>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="hover:text-primary transition-colors cursor-pointer">Beach Holidays</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Desert Adventure</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Heritage Trails</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Wellness &amp; Thalasso</li>
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
      <div className="border-t border-gray-100 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Rahi Travels — A Rahi Group company
      </div>
    </footer>
  );
}
