import { useEffect, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { Wallet, CreditCard } from 'lucide-react';
import { useApp } from './AppProvider';
import { CouponInput } from './CouponInput';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PaymentForm({
  initialAmount = 100,
  bookingType = 'package',
  bookingDetails = {},
  onComplete
}: {
  initialAmount?: number;
  bookingType?: string;
  bookingDetails?: any;
  onComplete?: () => void;
}) {
  const { user, walletBalance, spend, appliedCoupon, applyCouponCode, removeCoupon } = useApp();
  const [payMethod, setPayMethod] = useState<'card' | 'wallet'>('card');
  const [amount, setAmount] = useState(initialAmount);
  const [finalAmount, setFinalAmount] = useState(initialAmount);
  const [discount, setDiscount] = useState(0);
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (appliedCoupon) {
      setFinalAmount(appliedCoupon.finalAmount);
      setDiscount(appliedCoupon.discount);
    } else {
      setFinalAmount(amount);
      setDiscount(0);
    }
  }, [appliedCoupon, amount]);

  const handleWalletPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError('You must be logged in to complete a booking.'); return; }
    if (walletBalance < finalAmount) { setError('Insufficient wallet balance. Top up from your account page.'); return; }

    setLoading(true);
    setError('');
    try {
      const success = await spend(finalAmount, `Booking: ${bookingType}`, bookingDetails?.packageId);
      if (!success) { setError('Wallet payment failed. Please try again.'); return; }

      const walletBookingId = `wallet_${Date.now()}`;

      await fetch('/api/email/booking-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Rahi-Request': 'true' },
        body: JSON.stringify({
          customerEmail: user.email,
          customerName: user.name || 'Customer',
          bookingId: walletBookingId,
          bookingDetails,
          totalAmount: finalAmount,
          currency: 'EUR',
        })
      }).catch(() => {});

      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Rahi-Request': 'true' },
        body: JSON.stringify({
          userId: user.id,
          bookingId: walletBookingId,
          type: bookingType,
          details: bookingDetails,
          totalAmount: finalAmount,
          currency: 'EUR',
          departDate: bookingDetails?.date || new Date().toISOString(),
        })
      }).catch(() => {});

      if (onComplete) onComplete();
      else router.navigate({ to: '/bookings' });
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to complete a booking.');
      return;
    }

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Could not load payment gateway. Check your internet connection.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Rahi-Request': 'true' },
        body: JSON.stringify({
          amount: finalAmount,
          description: `Booking: ${bookingType}`
        })
      });

      if (!res.ok) throw new Error('Failed to create payment order');
      const { orderId, keyId, amount: orderAmount, currency } = await res.json();

      await new Promise<void>((resolve, reject) => {
        const options = {
          key: keyId,
          amount: orderAmount,
          currency,
          name: 'Rahi Travels',
          description: `Booking: ${bookingType}`,
          order_id: orderId,
          prefill: { email, name: user.name || '' },
          theme: { color: '#2563eb' },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Rahi-Request': 'true' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.success) {
                reject(new Error('Payment verification failed'));
                return;
              }

              const paymentId = verifyData.paymentId;

              await fetch('/api/email/booking-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Rahi-Request': 'true' },
                body: JSON.stringify({
                  customerEmail: email,
                  customerName: user.name || 'Customer',
                  bookingId: paymentId,
                  bookingDetails,
                  totalAmount: finalAmount,
                  discount: discount > 0 ? discount : undefined,
                  currency: 'EUR'
                })
              }).catch(() => {});

              await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Rahi-Request': 'true' },
                body: JSON.stringify({
                  userId: user.id,
                  bookingId: paymentId,
                  type: bookingType,
                  details: bookingDetails,
                  totalAmount: finalAmount,
                  currency: 'EUR',
                  departDate: bookingDetails?.date || new Date().toISOString(),
                })
              });

              if (appliedCoupon) {
                await fetch('/api/coupons/apply', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'X-Rahi-Request': 'true' },
                  body: JSON.stringify({ code: appliedCoupon.code })
                }).catch(() => {});
              }

              sessionStorage.setItem('paymentId', paymentId);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled'))
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });

      if (onComplete) onComplete();
      else router.navigate({ to: '/bookings' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed';
      if (msg !== 'Payment cancelled') setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-white p-8 shadow-sm max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Complete your booking</h2>

      <div className="flex rounded-2xl border border-border overflow-hidden mb-6">
        <button
          type="button"
          onClick={() => setPayMethod('card')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition ${payMethod === 'card' ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-secondary/50'}`}
        >
          <CreditCard className="w-4 h-4" /> Pay by card
        </button>
        <button
          type="button"
          onClick={() => setPayMethod('wallet')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition ${payMethod === 'wallet' ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-secondary/50'}`}
        >
          <Wallet className="w-4 h-4" /> Wallet <span className="opacity-70">(€{walletBalance.toFixed(2)})</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded text-red-700">
          {error}
        </div>
      )}

      {payMethod === 'wallet' ? (
        <form onSubmit={handleWalletPayment} className="space-y-4">
          <div className="rounded-2xl bg-slate-50 border border-border p-4 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Wallet balance</span><span className="font-semibold">€{walletBalance.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount to pay</span><span className="font-semibold">€{finalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between border-t pt-1 mt-1"><span className="text-muted-foreground">Balance after</span><span className={`font-bold ${walletBalance - finalAmount < 0 ? 'text-destructive' : 'text-primary'}`}>€{(walletBalance - finalAmount).toFixed(2)}</span></div>
          </div>
          {walletBalance < finalAmount && (
            <p className="text-sm text-destructive">Insufficient balance. <a href="/account" className="underline">Top up your wallet</a> to continue.</p>
          )}
          <button
            type="submit"
            disabled={loading || walletBalance < finalAmount}
            className="w-full btn-primary py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay €${finalAmount.toFixed(2)} from wallet`}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCardPayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Amount (EUR)</label>
            <input
              type="number"
              value={amount}
              readOnly
              className="w-full px-4 py-2 border border-border rounded-lg bg-gray-50"
            />
            {discount > 0 && (
              <div className="mt-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Original:</span><span>{amount.toFixed(2)} EUR</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount:</span><span>-{discount.toFixed(2)} EUR</span>
                </div>
                <div className="flex justify-between text-primary font-bold border-t mt-1 pt-1">
                  <span>Total:</span><span>{finalAmount.toFixed(2)} EUR</span>
                </div>
              </div>
            )}
          </div>

          <CouponInput
            amount={amount}
            appliedCoupon={appliedCoupon}
            onCouponApplied={(discount, finalAmount) => {
              setDiscount(discount);
              setFinalAmount(finalAmount);
            }}
            onRemoveCoupon={removeCoupon}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Opening payment...' : `Pay €${finalAmount.toFixed(2)}`}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            🔒 Secure payment powered by Razorpay
          </p>
        </form>
      )}
    </div>
  );
}
