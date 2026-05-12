import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/components/site/AppProvider";
import { packages } from "@/data/packages";
import { PackageCard } from "@/components/site/PackageCard";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare packages — Rahi Travels" },
      { name: "description", content: "Compare chosen packages side-by-side and decide what suits your Tunisia holiday best." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { comparePackageIds, savedPackageIds } = useApp();
  const comparedPackages = packages.filter((pkg) => comparePackageIds.includes(pkg.id));
  const savedPackages = packages.filter((pkg) => savedPackageIds.includes(pkg.id));

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:py-14">
      <div className="mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Compare packages</h1>
            <p className="text-muted-foreground mt-2">Review your selected packages side-by-side and refine your travel plan.</p>
          </div>
          <Link to="/packages" className="btn-outline">Browse more packages</Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Compare list</h2>
            {comparedPackages.length === 0 ? (
              <div className="text-sm text-muted-foreground">No packages selected for comparison yet.</div>
            ) : (
              <div className="grid gap-4">
                {comparedPackages.map((pkg) => (
                  <div key={pkg.id} className="rounded-3xl border border-border p-4 bg-slate-50">
                    <div className="flex items-start gap-4">
                      <img src={pkg.image} alt={pkg.name} className="h-20 w-24 rounded-2xl object-cover" />
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">{pkg.category}</div>
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <div className="text-sm text-muted-foreground">{pkg.duration} · {pkg.rating} ★</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">€{pkg.price.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">starting price</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Saved packages</h2>
            {savedPackages.length === 0 ? (
              <div className="text-sm text-muted-foreground">No packages saved yet. Save a package to revisit it later.</div>
            ) : (
              <div className="grid gap-4">
                {savedPackages.map((pkg) => (
                  <div key={pkg.id} className="rounded-3xl border border-border p-4 bg-slate-50">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <div className="text-sm text-muted-foreground">{pkg.category} · {pkg.duration}</div>
                      </div>
                      <Link to="/packages/$id" params={{ id: pkg.id }} className="text-primary text-sm hover:underline">View</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Compare tips</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Check the nightly rate, included meals and cancellation policy.</li>
              <li>Compare duration and pace to match your holiday mood.</li>
              <li>Use wallet credit for faster reservation on the package details page.</li>
              <li>Contact us on WhatsApp if you want a bespoke itinerary based on your shortlist.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-slate-50 p-6 text-sm text-muted-foreground">
            <p className="font-semibold mb-3">Need assistance?</p>
            <p>WhatsApp our local travel team to compare packages in real time and receive a custom itinerary.</p>
          </div>
        </aside>
      </div>

      {comparedPackages.length > 1 && (
        <div className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Side-by-side comparison</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {comparedPackages.map((pkg) => (
              <div key={pkg.id} className="rounded-3xl border border-border p-5">
                <h3 className="font-semibold mb-3">{pkg.name}</h3>
                <div className="text-sm text-muted-foreground mb-3">{pkg.category}</div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div><span className="font-semibold text-foreground">Price:</span> €{pkg.price.toLocaleString()}</div>
                  <div><span className="font-semibold text-foreground">Duration:</span> {pkg.duration}</div>
                  <div><span className="font-semibold text-foreground">Nights:</span> {pkg.nights}</div>
                  <div><span className="font-semibold text-foreground">Rating:</span> {pkg.rating}</div>
                  <div><span className="font-semibold text-foreground">Highlights:</span> {pkg.highlights.slice(0, 3).join(", ")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
