import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare, Loader2 } from 'lucide-react';
import { fetchAllReviews, Review } from '@/lib/store';

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-7 h-7' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25'}`}
        />
      ))}
    </div>
  );
}

const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

const ratingColors: Record<number, string> = {
  1: 'text-red-500',
  2: 'text-orange-400',
  3: 'text-yellow-500',
  4: 'text-lime-500',
  5: 'text-emerald-500',
};

export default function Reviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReviews().then((data) => {
      setReviews(data);
      setLoading(false);
    });
  }, []);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length
      ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
      : 0,
  }));

  return (
    <div className="min-h-screen bg-muted/30 pb-10">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Page Title */}
        <div className="text-center mb-8">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            Customer Feedback
          </span>
          <h1 className="text-3xl font-bold text-foreground">Reviews & Ratings</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Real feedback from our campus canteen customers
          </p>
        </div>

        {/* Overall Stats */}
        {!loading && reviews.length > 0 && (
          <div className="bg-card rounded-3xl border border-border shadow-sm p-6 mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Big average */}
              <div className="text-center flex-shrink-0">
                <div className="text-6xl font-extrabold text-foreground leading-none">
                  {avgRating.toFixed(1)}
                </div>
                <StarDisplay rating={Math.round(avgRating)} size="lg" />
                <p className="text-sm text-muted-foreground mt-1">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Bar chart */}
              <div className="flex-1 w-full space-y-2">
                {ratingCounts.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-2 text-muted-foreground text-right">{star}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Review List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-14 h-14 mx-auto mb-3 opacity-25" />
            <p className="font-semibold text-foreground">No reviews yet</p>
            <p className="text-sm mt-1">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-card rounded-2xl border border-border shadow-sm p-5 animate-fade-in hover:shadow-md transition-shadow"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm leading-tight">
                        {review.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Order: {review.orderToken}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <StarDisplay rating={review.rating} />
                    <span className={`text-xs font-semibold ${ratingColors[review.rating]}`}>
                      {ratingLabels[review.rating]}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3 bg-muted/50 rounded-xl px-4 py-3">
                    "{review.comment}"
                  </p>
                )}

                {/* Date */}
                <p className="text-xs text-muted-foreground text-right">
                  {new Date(review.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
