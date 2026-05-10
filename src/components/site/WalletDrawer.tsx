import { useState } from "react";
import { X, Wallet } from "lucide-react";
import { useApp } from "./AppProvider";

export function WalletDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { walletBalance, transactions, deposit } = useApp();
  const [amount, setAmount] = useState(100);

  if (!open) return null;

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
          <div className="mt-2 text-3xl font-semibold">TND {walletBalance.toLocaleString()}</div>
          <div className="mt-2 text-sm text-muted-foreground">Use wallet credit instantly for bookings and package reservations.</div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="wallet-amount">Top-up amount</label>
            <div className="flex gap-2">
              <input
                id="wallet-amount"
                type="number"
                min={50}
                step={25}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="input w-full"
              />
              <button onClick={() => deposit(amount)} className="btn-primary">Top-up</button>
            </div>
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
                  <div className={tx.type === "deposit" ? "text-green-600" : "text-rose-600"}>
                    {tx.type === "deposit" ? "+" : "-"}TND {tx.amount.toLocaleString()}
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
