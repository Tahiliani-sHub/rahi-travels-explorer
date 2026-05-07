import { useState, createContext, useContext, ReactNode } from "react";
import { X, Phone, MessageCircle, Check } from "lucide-react";

const WHATSAPP = "21671000000";

type Ctx = { open: (packageName?: string) => void };
const ModalCtx = createContext<Ctx | null>(null);

export const useBookingModal = () => {
  const c = useContext(ModalCtx);
  if (!c) throw new Error("BookingModalProvider missing");
  return c;
};

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pkg, setPkg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", date: "", adults: 2, children: 0, notes: "",
  });

  const open = (packageName = "Custom Trip") => {
    setPkg(packageName);
    setSubmitted(false);
    setForm({ name: "", phone: "", email: "", date: "", adults: 2, children: 0, notes: "" });
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hi Rahi Travels! I want to book ${pkg}.
Name: ${form.name} | Date: ${form.date} | Travellers: ${form.adults} Adults, ${form.children} Children | Phone: ${form.phone} | Notes: ${form.notes || "—"}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
    setSubmitted(true);
  };

  return (
    <ModalCtx.Provider value={{ open }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={close}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <div>
                <h4 className="font-semibold text-lg">Enquire Now</h4>
                <p className="text-sm text-muted-foreground">{pkg}</p>
              </div>
              <button onClick={close} className="p-1.5 rounded-md hover:bg-muted" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Our agent will contact you within 2 hours! ✓</h4>
                <p className="text-sm text-muted-foreground mb-6">Your WhatsApp message has been prepared. Need help sooner?</p>
                <a href="tel:+21671000000" className="btn-outline justify-center w-full"><Phone className="w-4 h-4" /> Call +216 71 000 000</a>
              </div>
            ) : (
              <form onSubmit={submit} className="p-5 space-y-4">
                <Field label="Full Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone" type="tel" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  <Field label="Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                </div>
                <Field label="Travel Date" type="date" required value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Adults" type="number" value={String(form.adults)} onChange={(v) => setForm({ ...form, adults: Number(v) })} />
                  <Field label="Children" type="number" value={String(form.children)} onChange={(v) => setForm({ ...form, children: Number(v) })} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Special Requests</label>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  <MessageCircle className="w-4 h-4" /> Send via WhatsApp
                </button>
                <div className="text-center text-sm text-muted-foreground">
                  Or call us directly:{" "}
                  <a href="tel:+21671000000" className="text-link">+216 71 000 000</a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </ModalCtx.Provider>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}{required && <span className="text-destructive"> *</span>}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} min={type === "number" ? 0 : undefined}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
    </div>
  );
}
