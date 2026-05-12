import { useState } from 'react';
import { Star, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface ReviewFormProps {
  itemId: string;
  itemType: string;
  userId?: string;
  userName?: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ itemId, itemType, userId, userName, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError('Please log in to leave a review');
      return;
    }

    if (rating === 0 || !title.trim() || !comment.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Rahi-Request': 'true' },
        body: JSON.stringify({
          userId,
          itemId,
          itemType,
          rating,
          title,
          comment
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmitted(true);
      setRating(0);
      setTitle('');
      setComment('');
      onReviewSubmitted?.();

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">Sign in to leave a review</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Leave a Review</h3>

      {submitted && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
          ✓ Review submitted successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="text-sm font-medium mb-2 block">Rating</label>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="text-sm font-medium mb-1 block">
            Review Title *
          </label>
          <Input
            id="title"
            placeholder="e.g., Amazing experience!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            disabled={loading}
          />
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="text-sm font-medium mb-1 block">
            Your Review *
          </label>
          <Textarea
            id="comment"
            placeholder="Share your detailed experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">{comment.length}/500</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader className="inline mr-2 animate-spin" size={16} />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </form>
    </Card>
  );
}
