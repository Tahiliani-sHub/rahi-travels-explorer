import { Link } from "@tanstack/react-router";
import { Star, Clock, MapPin } from "lucide-react";
import type { Package } from "@/data/packages";
import { useBookingModal } from "./BookingModal";

export function PackageCard({ pkg }: { pkg: Package }) {
  const { open } = useBookingModal();
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
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Starting from</div>
            <div className="font-bold text-lg text-foreground">TND {pkg.price.toLocaleString()}</div>
          </div>
          <div className="flex gap-2">
            <Link to="/packages/$id" params={{ id: pkg.id }} className="btn-outline text-sm">Details</Link>
            <button onClick={() => open(pkg.name)} className="btn-primary text-sm">Book</button>
          </div>
        </div>
      </div>
    </article>
  );
}
