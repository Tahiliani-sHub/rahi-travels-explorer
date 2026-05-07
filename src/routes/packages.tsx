import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { packages } from "@/data/packages";
import { PackageCard } from "@/components/site/PackageCard";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Tunisia Packages — Rahi Travels" },
      { name: "description", content: "Browse all Tunisia travel packages: beach, desert, heritage, wellness and grand tours." },
    ],
  }),
  component: PackagesPage,
});

const cats = ["Beach", "Desert", "Heritage", "Wellness", "Adventure"];
const durations = ["3N", "4N", "5N", "7N+"];

function PackagesPage() {
  const [budget, setBudget] = useState(3000);
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [activeDur, setActiveDur] = useState<string[]>([]);
  const [sort, setSort] = useState("popularity");

  const filtered = useMemo(() => {
    let r = packages.filter((p) => p.price <= budget);
    if (activeCats.length) r = r.filter((p) => activeCats.some((c) => p.category.toLowerCase().includes(c.toLowerCase()) || (c === "Desert" && p.category === "Adventure")));
    if (activeDur.length) {
      r = r.filter((p) =>
        activeDur.some((d) => {
          if (d === "7N+") return p.nights >= 7;
          return p.duration.startsWith(d);
        })
      );
    }
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    return r;
  }, [budget, activeCats, activeDur, sort]);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
      <div className="mb-8">
        <h1 className="mb-3" style={{ fontSize: "2.5rem" }}>All Packages</h1>
        <p className="text-muted-foreground">Filter, compare, and enquire on WhatsApp in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="card-surface p-6 h-fit lg:sticky lg:top-24">
          <div className="mb-6">
            <h5 className="font-semibold mb-3">Budget (TND)</h5>
            <input type="range" min={300} max={3000} step={100} value={budget} onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[var(--brand-primary)]" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>300</span><span className="font-semibold text-foreground">Up to {budget}</span><span>3000+</span>
            </div>
          </div>

          <div className="mb-6">
            <h5 className="font-semibold mb-3">Duration</h5>
            <div className="flex flex-wrap gap-2">
              {durations.map((d) => (
                <button key={d} onClick={() => toggle(activeDur, d, setActiveDur)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition ${activeDur.includes(d) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-semibold mb-3">Category</h5>
            <div className="flex flex-col gap-2">
              {cats.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition">
                  <input type="checkbox" checked={activeCats.includes(c)} onChange={() => toggle(activeCats, c, setActiveCats)}
                    className="accent-[var(--brand-primary)] w-4 h-4" />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{filtered.length} package{filtered.length !== 1 && "s"} found</p>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="popularity">Sort: Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="card-surface p-12 text-center">
              <p className="text-muted-foreground">No packages match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p) => <PackageCard key={p.id} pkg={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
