import { Link } from "@tanstack/react-router";
import { Star, Clock, MapPin, Heart, Shuffle, Wallet } from "lucide-react";
import type { Package } from "@/data/packages";
import { useBookingModal } from "./BookingModal";
import { useApp } from "./AppProvider";

export function PackageCard({ pkg }: { pkg: Package }) {
  const { open } = useBookingModal();
  const { user, toggleSavedPackage, toggleComparePackage, isSavedPackage, isComparedPackage, walletBalance, spend } = useApp();
  const saved = isSavedPackage(pkg.id);
  const compared = isComparedPackage(pkg.id);

  return (
    <article className="card-surface flex flex-col">
      <Link to="/packages/$id" params={{ id: pkg.id }} className="block aspect-[4/3] overflow-hidden">
        <img src={pkg.image} alt={pkg.name} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{pkg.category}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pkg.duration}</span>
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-current text-yellow-500" />{pkg.rating}</span>
        </div>
        <h4 className="font-semibold mb-1">{pkg.name}</h4>
        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{pkg.tagline}</p>
        <ul className="text-sm text-muted-foreground space-y-1 mb-4">
          {pkg.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex gap-2"><span className="text-primary">•</span>{h}</li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
          <button
            type="button"
            onClick={() => toggleSavedPackage(pkg.id)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${saved ? "border-primary bg-primary/10 text-primary" : "border-gray-200 bg-white text-muted-foreground"}`}
          >
            <Heart className="w-3.5 h-3.5" /> {saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => toggleComparePackage(pkg.id)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${compared ? "border-primary bg-primary/10 text-primary" : "border-gray-200 bg-white text-muted-foreground"}`}
          >
            <Shuffle className="w-3.5 h-3.5" /> {compared ? "Comparing" : "Compare"}
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Starting from</div>
              <div className="font-bold text-lg text-foreground">TND {pkg.price.toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <Link to="/packages/$id" params={{ id: pkg.id }} className="btn-outline text-sm">Details</Link>
              <button
                onClick={() => {
                  if (!user) {
                    window.location.assign(`/login?next=/packages/${pkg.id}`);
                    return;
                  }
                  open(pkg.name);
                }}
                className="btn-primary text-sm"
              >
                Book
              </button>
            </div>
          </div>
          <button
            type="button"
            disabled={!user || walletBalance < pkg.price}
            onClick={() => {
              if (!user) {
                window.location.assign(`/login?next=/packages/${pkg.id}`);
                return;
              }
              spend(pkg.price, `Booked ${pkg.name} with wallet`, pkg.id);
            }}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${!user || walletBalance < pkg.price ? "bg-gray-200 text-muted-foreground cursor-not-allowed" : "bg-secondary text-secondary-foreground hover:bg-secondary/90"}`}
          >
            <Wallet className="w-4 h-4" /> Reserve with Wallet
          </button>
        </div>
      </div>
    </article>
  );
}
