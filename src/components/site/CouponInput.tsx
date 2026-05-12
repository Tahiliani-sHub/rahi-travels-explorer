import { useState } from 'react';
import { X, Loader, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface CouponInputProps {
  amount: number;
  onCouponApplied?: (discount: number, finalAmount: number) => void;
  appliedCoupon?: { code: string; discount: number; finalAmount: number } | null;
  onRemoveCoupon?: () => void;
}

export function CouponInput({ amount, onCouponApplied, appliedCoupon, onRemoveCoupon }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase(), amount })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid coupon');
      }

      const data = await response.json();
      onCouponApplied?.(data.discount, data.finalAmount);
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply coupon');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <Card className="p-3 bg-green-50 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="text-green-600" size={20} />
            <div>
              <p className="font-semibold text-sm text-green-900">Coupon Applied</p>
              <p className="text-xs text-green-700">{appliedCoupon.code}</p>
              <p className="text-sm font-bold text-green-900 mt-1">
                Savings: {appliedCoupon.discount.toFixed(2)} TND
              </p>
            </div>
          </div>
          <button
            onClick={onRemoveCoupon}
            className="text-green-600 hover:text-green-800"
          >
            <X size={20} />
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <form onSubmit={handleApplyCoupon} className="space-y-2">
        <label className="text-sm font-medium">Coupon Code (Optional)</label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={loading}
            maxLength={20}
          />
          <Button
            type="submit"
            disabled={loading || !code.trim()}
            variant="outline"
            className="px-4"
          >
            {loading ? <Loader className="animate-spin" size={16} /> : 'Apply'}
          </Button>
        </div>
      </form>

      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
