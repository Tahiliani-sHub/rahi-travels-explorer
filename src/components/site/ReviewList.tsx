import { useState, useEffect } from 'react';
import { Star, Trash2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface ReviewListProps {
  itemId: string;
  currentUserId?: string;
  onReviewDeleted?: () => void;
}

export function ReviewList({ itemId, currentUserId, onReviewDeleted }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reviews/item/${itemId}`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const data = await response.json();
        setReviews(data);
        setError(null);
      } catch (err) {
        setError('Could not load reviews');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [itemId]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'X-Rahi-Request': 'true' }
      });
      if (!response.ok) throw new Error('Failed to delete review');
      
      setReviews(reviews.filter(r => r.id !== reviewId));
      onReviewDeleted?.();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Could not delete review');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8"><Loader className="animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review!</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="font-semibold text-sm">{review.title}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">by {review.user.name}</p>
            </div>
            {currentUserId === review.user.id && (
              <button
                onClick={() => handleDeleteReview(review.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-700">{review.comment}</p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </Card>
      ))}
    </div>
  );
}
