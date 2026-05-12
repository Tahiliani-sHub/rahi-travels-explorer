import { useState, useEffect } from 'react';
import { Star, Loader } from 'lucide-react';

interface RatingDisplayProps {
  itemId: string;
}

export function RatingDisplay({ itemId }: RatingDisplayProps) {
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reviews/rating/${itemId}`);
        if (!response.ok) throw new Error('Failed to fetch rating');
        const data = await response.json();
        setAverageRating(data.averageRating);
        setReviewCount(data.reviewCount);
      } catch (err) {
        console.error('Failed to fetch rating:', err);
        setAverageRating(0);
        setReviewCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [itemId]);

  if (loading) {
    return <Loader size={16} className="animate-spin" />;
  }

  if (averageRating === 0 || reviewCount === 0) {
    return <p className="text-sm text-gray-500">No reviews yet</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < Math.round(averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
      <span className="text-sm font-medium">{averageRating?.toFixed(1)}</span>
      <span className="text-xs text-gray-500">({reviewCount})</span>
    </div>
  );
}
