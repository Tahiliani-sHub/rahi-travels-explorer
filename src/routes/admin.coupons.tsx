import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/components/site/AppProvider";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({
    meta: [{ title: "Coupon admin — Rahi Travels" }],
  }),
  component: CouponAdminPage,
});

type Coupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  active: boolean;
};

function CouponAdminPage() {
  const { user } = useApp();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "10",
    maxUses: "-1",
    validFrom: new Date().toISOString().split("T")[0],
    validTo: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) setCoupons(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Rahi-Request": "true" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          maxUses: parseInt(form.maxUses),
          validFrom: form.validFrom,
          validTo: form.validTo,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create coupon"); return; }
      setSuccess(`Coupon ${data.coupon.code} created!`);
      setForm(f => ({ ...f, code: "" }));
      fetchCoupons();
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="text-muted-foreground">Sign in to access admin tools.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 lg:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Coupon admin</h1>
        <p className="text-muted-foreground">Create and manage discount coupons.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <div className="rounded-3xl border border-border bg-white p-8 shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-6">Create coupon</h2>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Code</span>
              <input
                required
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
                className="mt-1 w-full rounded-2xl border border-border px-4 py-2.5 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Discount type</span>
              <select
                value={form.discountType}
                onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (EUR)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">
                {form.discountType === "percentage" ? "Discount (%)" : "Discount (EUR)"}
              </span>
              <input
                required
                type="number"
                min="0"
                max={form.discountType === "percentage" ? "100" : undefined}
                value={form.discountValue}
                onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Max uses (-1 = unlimited)</span>
              <input
                required
                type="number"
                min="-1"
                value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-muted-foreground">Valid from</span>
                <input
                  required
                  type="date"
                  value={form.validFrom}
                  onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-muted-foreground">Valid to</span>
                <input
                  required
                  type="date"
                  value={form.validTo}
                  onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
            <button type="submit" disabled={submitting} className="w-full btn-primary py-3 disabled:opacity-50">
              {submitting ? "Creating..." : "Create coupon"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">All coupons</h2>
          {loading ? (
            <div className="space-y-3">
              {[0,1,2].map(i => <div key={i} className="skeleton h-16 rounded-3xl" />)}
            </div>
          ) : coupons.length === 0 ? (
            <div className="rounded-3xl border border-border bg-white p-8 text-center text-muted-foreground">
              No coupons yet. Create one to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map(c => (
                <div key={c.id} className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="font-mono font-bold text-lg">{c.code}</span>
                      <span className={`ml-3 rounded-full px-2 py-0.5 text-xs font-semibold ${c.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {c.usedCount} / {c.maxUses === -1 ? "∞" : c.maxUses} uses
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>{c.discountType === "percentage" ? `${c.discountValue}% off` : `€${c.discountValue} off`}</span>
                    <span>·</span>
                    <span>{new Date(c.validFrom).toLocaleDateString()} – {new Date(c.validTo).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
