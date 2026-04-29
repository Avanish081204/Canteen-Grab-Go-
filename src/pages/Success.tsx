import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Home, Monitor, Download, Star, Send, MessageSquare } from 'lucide-react';
import { fetchOrderByToken, Order, clearOrderType, submitReview, hasReviewForOrder } from '@/lib/store';
import { toast } from 'sonner';
import { printBill } from '@/lib/bill-utils';

const tokenClasses = {
  'dine-in': 'bg-sky-500',
  'take-away': 'bg-emerald-500',
  'staff-delivery': 'bg-purple-500',
};

const statusMessages = {
  'dine-in': 'Collect from counter when your token is called',
  'take-away': 'Your packed order will be ready at the counter',
  'staff-delivery': 'Your order will be delivered to your location',
};


export default function Success() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  // Review state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!token) return;
      
      try {
        const foundOrder = await fetchOrderByToken(token);
        if (foundOrder) {
          setOrder(foundOrder);
          clearOrderType();
          // Check if review was already submitted for this order
          const alreadyReviewed = await hasReviewForOrder(foundOrder.id);
          if (alreadyReviewed) setReviewDone(true);
        } else {
          console.warn('Order not found even in database');
          navigate('/');
        }
      } catch (err) {
        console.error('Error loading order on success page:', err);
        navigate('/');
      }
    }
    
    loadOrder();
  }, [token, navigate]);

  const handleSubmitReview = async () => {
    if (!order) return;
    if (rating === 0) {
      toast.error('Please select a star rating before submitting.');
      return;
    }
    setReviewSubmitting(true);
    const ok = await submitReview({
      orderId: order.id,
      orderToken: order.token,
      customerName: order.customerName || 'Anonymous',
      rating,
      comment: comment.trim(),
      items: order.items
    });
    setReviewSubmitting(false);
    if (ok) {
      setReviewDone(true);
      toast.success('Thank you for your review! 🎉');
    } else {
      toast.error('Could not submit review. Please try again.');
    }
  };

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Success Animation */}
        <div className="mb-8 animate-bounce-in">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-14 h-14 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Placed!</h1>
          <p className="text-muted-foreground">Your order has been confirmed</p>
        </div>

        {/* Token Display */}
        <div className="bg-card rounded-3xl shadow-xl p-8 border border-border mb-6 animate-slide-up">
          <p className="text-sm text-muted-foreground mb-4">Your Token Number</p>
          <div className={`token-badge text-4xl md:text-5xl ${tokenClasses[order.type]} mb-6`}>
            {order.token}
          </div>
          <p className="text-muted-foreground">
            {statusMessages[order.type]}
          </p>

          {/* Order Details */}
          <div className="mt-8 pt-6 border-t border-border text-left">
            <h3 className="font-semibold mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">₹{order.total}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-semibold px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                ✅ Paid Online (UPI)
              </span>
            </div>
          </div>

          {order.type === 'staff-delivery' && (
            <div className="mt-4 pt-4 border-t border-border text-left text-sm space-y-1">
              <p><span className="text-muted-foreground">Delivery to:</span> {order.department}</p>
              <p><span className="text-muted-foreground">Location:</span> {order.location}</p>
              <p><span className="text-muted-foreground">Time:</span> {order.timeSlot}</p>
            </div>
          )}
        </div>

        {/* Download Invoice */}
        <button
          onClick={() => printBill(order)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:brightness-110 transition-all mb-4"
          style={{ boxShadow: 'var(--shadow-primary)' }}
        >
          <Download className="w-5 h-5" />
          Download Invoice
        </button>

        {/* ── Review Section ────────────────────────────────────── */}
        <div className="bg-card rounded-3xl shadow-xl border border-border mb-6 overflow-hidden animate-slide-up">
          <div className="p-5 pb-4 border-b border-border flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-foreground">Rate Your Experience</h2>
          </div>

          {reviewDone ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-semibold text-foreground">Thanks for your review!</p>
              <div className="flex justify-center gap-1 mt-2">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Your feedback helps us improve 🙏</p>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {/* Star Picker */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    id={`review-star-${star}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm font-medium text-amber-500">
                  {['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent 🤩'][rating]}
                </p>
              )}

              {/* Comment */}
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience... (optional)"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/60"
              />

              <button
                id="submit-review-btn"
                onClick={handleSubmitReview}
                disabled={reviewSubmitting || rating === 0}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reviewSubmitting ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground font-semibold py-4 rounded-xl hover:bg-muted/80 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/display')}
            className="flex-1 flex items-center justify-center gap-2 btn-hero !py-4"
          >
            <Monitor className="w-5 h-5" />
            View Display
          </button>
        </div>
      </div>
    </div>
  );
}
