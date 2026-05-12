import { ReactNode } from 'react';

// Razorpay uses a hosted checkout modal loaded on demand — no client-side provider needed.
export function StripeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
