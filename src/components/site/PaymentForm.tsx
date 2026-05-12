import { useEffect, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Wallet, CreditCard } from 'lucide-react';
import { useApp } from './AppProvider';
import { CouponInput } from './CouponInput';

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
  const stripe = useStripe();
  const elements = useElements();
  const { user, walletBalance, spend, appliedCoupon, applyCouponCode, removeCoupon } = useApp();
  const [payMethod, setPayMethod] = useState<'card' | 'wallet'>('card');
  const [amount, setAmount] = useState(initialAmount);
  const [finalAmount, setFinalAmount] = useState(initialAmount);
  const [discount, setDiscount] = useState(0);
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const router = useRouter();

  // Update final amount when coupon changes
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

      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          bookingId: `wallet_${Date.now()}`,
          type: bookingType,
          details: bookingDetails,
          totalAmount: finalAmount,
          currency: 'TND',
          departDate: bookingDetails?.date || new Date().toISOString(),
        })
      }).catch(() => {});

      if (onComplete) onComplete();
      else router.navigate({ to: '/bookings' });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is not loaded');
      return;
    }

    if (!user) {
      setError('You must be logged in to complete a booking.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create payment intent
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'TND',
          description: `Booking: ${bookingType}`,
          email
        })
      });

      if (!response.ok) throw new Error('Failed to create payment');

      const data = await response.json();
      setClientSecret(data.clientSecret);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Step 2: Confirm payment with card
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email }
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
        return;
      }

      if (result.paymentIntent.status === 'succeeded') {
        // Step 3: Send confirmation email
        await fetch('/api/email/booking-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerEmail: email,
            customerName: user.name || 'Customer',
            bookingId: result.paymentIntent.id,
            bookingDetails,
            totalAmount: finalAmount,
            discount: discount > 0 ? discount : undefined,
            currency: 'TND'
          })
        }).catch(e => console.error("Email failed, continuing:", e));

        // Step 4: Persist booking to database
        const bookingRes = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            bookingId: result.paymentIntent.id,
            type: bookingType,
            details: bookingDetails,
            totalAmount: finalAmount,
            currency: 'TND',
            departDate: bookingDetails?.date || new Date().toISOString(),
          })
        });

        if (!bookingRes.ok) {
           console.error("Failed to save booking to db.");
        }

        if (appliedCoupon) {
          await fetch('/api/coupons/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: appliedCoupon.code })
          }).catch(e => console.error("Failed to apply coupon:", e));
        }

        sessionStorage.setItem('paymentIntentId', result.paymentIntent.id);
        if (onComplete) {
          onComplete();
        } else {
          router.navigate({ to: '/bookings' });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-white p-8 shadow-sm max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Complete your booking</h2>

      {/* Payment method toggle */}
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
          <Wallet className="w-4 h-4" /> Wallet <span className="opacity-70">(TND {walletBalance.toFixed(2)})</span>
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
            <div className="flex justify-between"><span className="text-muted-foreground">Wallet balance</span><span className="font-semibold">TND {walletBalance.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount to pay</span><span className="font-semibold">TND {finalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between border-t pt-1 mt-1"><span className="text-muted-foreground">Balance after</span><span className={`font-bold ${walletBalance - finalAmount < 0 ? 'text-destructive' : 'text-primary'}`}>TND {(walletBalance - finalAmount).toFixed(2)}</span></div>
          </div>
          {walletBalance < finalAmount && (
            <p className="text-sm text-destructive">Insufficient balance. <a href="/account" className="underline">Top up your wallet</a> to continue.</p>
          )}
          <button
            type="submit"
            disabled={loading || walletBalance < finalAmount}
            className="w-full btn-primary py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay TND ${finalAmount.toFixed(2)} from wallet`}
          </button>
        </form>
      ) : (
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Email
          </label>
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
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Amount (TND)
          </label>
          <div className="flex justify-between">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              min="1"
              step="0.01"
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="0.00"
              disabled // Should typically not be editable directly here
            />
          </div>
          {discount > 0 && (
            <div className="mt-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Original:</span>
                <span>{amount.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount:</span>
                <span>-{discount.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-primary font-bold border-t mt-1 pt-1">
                <span>Total:</span>
                <span>{finalAmount.toFixed(2)} TND</span>
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

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Card Details
          </label>
          <div className="p-4 border border-border rounded-lg bg-gray-50">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !stripe}
          className="w-full btn-primary py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay TND ${amount.toFixed(2)}`}
        </button>
      </form>
      )}

      <p className="text-xs text-muted-foreground text-center mt-4">
        🔒 Secure payment powered by Stripe
      </p>
    </div>
  );
}


