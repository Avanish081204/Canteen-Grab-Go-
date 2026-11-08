import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Home, Monitor, Download, Star, Send, MessageSquare, Share2 } from 'lucide-react';
import { fetchOrderByToken, Order, clearOrderType, submitReview, hasReviewForOrder } from '@/lib/store';
import { toast } from 'sonner';
import { printBill } from '@/lib/bill-utils';
import { QRCodeSVG } from 'qrcode.react';

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
    const result = await submitReview({
      orderId: order.id,
      orderToken: order.token,
      customerName: order.customerName || 'Anonymous',
      rating,
      comment: comment.trim(),
      items: order.items
    });
    setReviewSubmitting(false);
    if (result.success) {
      setReviewDone(true);
      toast.success('Thank you for your review.');
    } else {
      toast.error(`Error: ${result.error || 'Could not submit review'}`);
    }
  };

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-3 sm:px-4 pb-32 md:pb-12">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Success Animation */}
        <div className="mb-4 sm:mb-6 animate-bounce-in">
          <div className="w-14 h-14 sm:w-18 sm:h-18 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground mb-0.5">Order Placed!</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Your order has been confirmed</p>
        </div>

        {/* Token Display */}
        <div className="bg-card rounded-2xl sm:rounded-3xl shadow-md p-4 sm:p-6 border border-border mb-4 animate-slide-up">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Your Token Number</p>
          <div className={`token-badge !text-sm sm:!text-2xl font-mono font-extrabold tracking-tight ${tokenClasses[order.type]} mb-3 sm:mb-4 whitespace-nowrap overflow-hidden text-ellipsis px-3 py-2 rounded-xl`}>
            {order.token}
          </div>
          <p className="text-xs text-muted-foreground">
            {statusMessages[order.type]}
          </p>

          {/* Counter QR Code Verification */}
          <div className="mt-5 p-4 rounded-2xl bg-white text-black shadow-inner flex flex-col items-center justify-center border border-border/40">
            <QRCodeSVG
              value={JSON.stringify({
                token: order.token,
                id: order.id,
                total: order.total,
                status: order.status,
              })}
              size={135}
              level="M"
              includeMargin
            />
            <p className="text-[11px] font-bold text-gray-700 mt-2">
              Scan at canteen counter for instant verification
            </p>
          </div>

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
              <span className="font-semibold px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Paid Online (UPI)
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

        {/* Action Buttons: WhatsApp Share & Download Invoice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
          <button
            onClick={() => {
              const itemsList = order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
              const text = `*Campus Canteen — Order Confirmation*\nToken: ${order.token}\nAmount: ₹${order.total}\nItems: ${itemsList}\nType: ${order.type.toUpperCase()}\n\nTrack your order: ${window.location.origin}/track?token=${order.token}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            Share on WhatsApp
          </button>

          <button
            onClick={() => printBill(order)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-xs sm:text-sm py-2.5 sm:py-3.5 rounded-xl hover:brightness-110 transition-all shadow-md active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </button>
        </div>

        {/* ── Review Section ────────────────────────────────────── */}
        <div className="bg-card rounded-2xl shadow-md border border-border mb-4 overflow-hidden animate-slide-up">
          <div className="p-3.5 sm:p-4 border-b border-border flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-xs sm:text-sm text-foreground">Rate Your Experience</h2>
          </div>

          {reviewDone ? (
            <div className="p-4 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-xs sm:text-sm text-foreground">Thanks for your review!</p>
              <div className="flex justify-center gap-1 mt-1.5">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Your feedback helps us improve.</p>
            </div>
          ) : (
            <div className="p-3.5 sm:p-5 space-y-3">
              {/* Star Picker */}
              <div className="flex justify-center gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    id={`review-star-${star}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-xs font-semibold text-amber-500">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                </p>
              )}

              {/* Comment */}
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience... (optional)"
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/60"
              />

              <button
                id="submit-review-btn"
                onClick={handleSubmitReview}
                disabled={reviewSubmitting || rating === 0}
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reviewSubmitting ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-1.5 bg-muted text-foreground text-xs sm:text-sm font-bold py-2.5 sm:py-3 rounded-xl hover:bg-muted/80 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => navigate('/display')}
            className="flex-1 flex items-center justify-center gap-1.5 btn-hero !py-2.5 sm:!py-3 text-xs sm:text-sm font-bold rounded-xl"
          >
            <Monitor className="w-4 h-4" />
            Display
          </button>
        </div>
      </div>
    </div>
  );
}
