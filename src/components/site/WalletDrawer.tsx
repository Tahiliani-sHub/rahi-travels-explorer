import { useState } from "react";
import { X, Wallet, Loader2 } from "lucide-react";
import { useApp } from "./AppProvider";

const PRESET_AMOUNTS = [100, 200, 500, 1000];

export function WalletDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, walletBalance, transactions, refreshBalance, recordTransaction } = useApp();
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  const handleTopUp = async () => {
    if (!user || amount < 10) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) { resolve(); return; }
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Could not load payment gateway"));
        document.body.appendChild(s);
      });

      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Rahi-Request": "true" },
        body: JSON.stringify({ amount, description: "Wallet top-up" }),
      });
      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create payment order");
      }
      const { orderId, keyId, amount: orderAmount, currency } = await orderRes.json();

      await new Promise<void>((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
          key: keyId,
          amount: orderAmount,
          currency,
          name: "Rahi Travels",
          description: "Wallet top-up",
          order_id: orderId,
          prefill: { email: user.email, name: user.name },
          theme: { color: "#16a34a" },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch("/api/wallet/topup-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Rahi-Request": "true" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: user.id,
                  amount,
                }),
              });
              const data = await verifyRes.json();
              if (!verifyRes.ok || !data.success) {
                reject(new Error("Payment verification failed"));
                return;
              }
              await refreshBalance();
              recordTransaction({ type: "deposit", amount, note: "Wallet top-up" });
              setSuccess(`€${amount} added to your wallet.`);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("cancelled")) },
        });
        rzp.open();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Top-up failed";
      if (msg !== "cancelled") setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-end">
      <div className="w-full max-w-md bg-white shadow-xl p-6 rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none sm:rounded-br-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Wallet className="w-5 h-5" /> Wallet Center
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="rounded-3xl border border-gray-200 p-5 bg-slate-50 mb-6">
          <div className="text-sm text-muted-foreground">Available balance</div>
          <div className="mt-2 text-3xl font-semibold">€{walletBalance.toLocaleString()}</div>
          <div className="mt-2 text-sm text-muted-foreground">Use wallet credit instantly for bookings and package reservations.</div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Top-up amount</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_AMOUNTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${amount === p ? "bg-green-600 text-white border-green-600" : "border-gray-300 hover:border-green-500"}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={10}
                step={10}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="input w-full"
              />
              <button
                onClick={handleTopUp}
                disabled={loading || amount < 10}
                className="btn-primary flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Pay & Top-up
              </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
          </div>

          <div className="rounded-3xl border border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Recent Activity</p>
              <span className="text-xs text-muted-foreground">Latest 5</span>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-foreground">{tx.note}</div>
                    <div className="text-xs">{new Date(tx.date).toLocaleDateString()} · {tx.type === "deposit" ? "Top-up" : "Booking"}</div>
                  </div>
                  <div className={tx.type === "deposit" ? "text-green-600 font-medium" : "text-rose-600 font-medium"}>
                    {tx.type === "deposit" ? "+" : "-"}€{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && <div className="text-sm text-muted-foreground">No wallet activity yet. Top up to start booking.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
