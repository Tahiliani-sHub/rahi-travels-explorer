import { ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Vite exposes env vars via import.meta.env, NOT process.env.
// The key must be prefixed with VITE_ in your .env file.
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined;

// Only attempt to load Stripe if we have a real-looking key.
// This avoids crashes in dev when the key is not configured.
const stripePromise = stripeKey && stripeKey.startsWith('pk_')
  ? loadStripe(stripeKey)
  : null;

export function StripeProvider({ children }: { children: ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}

