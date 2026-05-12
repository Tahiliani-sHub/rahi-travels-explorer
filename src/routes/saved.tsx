import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Plane, Building2, Train, Sun, X } from "lucide-react";
import { useApp } from "@/components/site/AppProvider";
import { packages } from "@/data/packages";
import { PackageCard } from "@/components/site/PackageCard";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved items — Rahi Travels" },
      { name: "description", content: "Your saved flights, hotels, trains, holidays and packages." },
    ],
  }),
  component: SavedPage,
});

const typeIcon = {
  flight: Plane,
  hotel: Building2,
  train: Train,
  holiday: Sun,
};

function SavedPage() {
  const { user, savedPackageIds, savedItems, toggleSavedItem, toggleSavedPackage } = useApp();
  const savedPackages = packages.filter((p) => savedPackageIds.includes(p.id));
  const total = savedPackages.length + savedItems.length;

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <div className="rounded-3xl border border-border bg-white p-10 shadow-sm">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <h1 className="text-3xl font-semibold mb-4">Sign in to view your saved items</h1>
          <p className="text-muted-foreground mb-6">
            Your saved flights, hotels, trains, and packages are tied to your account.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/login" search={{ next: "/saved" } as any} className="btn-primary">Sign in</Link>
            <Link to="/signup" className="btn-outline">Create account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Saved items</h1>
          <p className="text-muted-foreground mt-1">{total} item{total !== 1 ? "s" : ""} saved</p>
        </div>
        <Link to="/" className="btn-outline">Explore more</Link>
      </div>

      {total === 0 && (
        <div className="rounded-3xl border border-border bg-white p-16 text-center shadow-sm">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-semibold mb-2">Nothing saved yet</h2>
          <p className="text-muted-foreground mb-6">
            Hit the Save button on any flight, hotel, train, holiday, or package to find it here later.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/flights" className="btn-primary">Search flights</Link>
            <Link to="/hotels" className="btn-outline">Search hotels</Link>
            <Link to="/packages" className="btn-outline">Browse packages</Link>
          </div>
        </div>
      )}

      {savedPackages.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-5">Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedPackages.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        </section>
      )}

      {savedItems.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-5">Flights, Hotels & More</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedItems.map((item) => {
              const Icon = typeIcon[item.type];
              return (
                <div key={item.id} className="rounded-3xl border border-border bg-white p-5 shadow-sm relative">
                  <button
                    type="button"
                    onClick={() => toggleSavedItem(item)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition"
                    aria-label="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">{item.type}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.subtitle}</p>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg">€{item.price.toLocaleString()}</div>
                    <span className="text-xs text-muted-foreground">
                      Saved {new Date(item.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
