import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UtensilsCrossed, Package, Truck, Sparkles, Clock, Ticket, Star, ChevronRight } from 'lucide-react';
import OrderTypeCard from '@/components/OrderTypeCard';
import heroImage from '@/assets/hero-food.jpg';
import { setOrderType, fetchAllReviews, Review } from '@/lib/store';
import Logo from '@/components/Logo';

export default function Index() {
  const navigate = useNavigate();

  const handleOrderType = (type: 'dine-in' | 'take-away' | 'staff-delivery') => {
    if (type === 'staff-delivery') {
      navigate('/staff-code');
    } else {
      setOrderType(type);
      navigate('/menu');
    }
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-orange-600/85" />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8 animate-bounce-in">
              <Logo size="lg" className="shadow-2xl" />
            </div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-white/90 text-sm font-medium">Fresh &amp; Delicious</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 animate-slide-up leading-tight">
              Welcome to
              <span className="block text-secondary drop-shadow-lg">Campus Canteen</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/85 mb-10 animate-slide-up max-w-2xl mx-auto">
              Quick bites, delicious meals — order your way and skip the queue!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 animate-bounce-in">
              <div className="bg-white/15 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 hover-scale">
                <span className="text-lg font-semibold text-white flex items-center gap-2">
                  🍔 Fresh Food
                </span>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 hover-scale">
                <span className="text-lg font-semibold text-white flex items-center gap-2">
                  ⚡ Fast Service
                </span>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 hover-scale">
                <span className="text-lg font-semibold text-white flex items-center gap-2">
                  🎫 Token System
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </section>

      {/* Order Type Selection */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">Choose Your Way</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
              How would you like to order?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Select your preferred ordering method and enjoy your meal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <OrderTypeCard
              title="Dine In"
              description="Collect from counter using your token number"
              icon={UtensilsCrossed}
              emoji="🍽️"
              color="blue"
              onClick={() => handleOrderType('dine-in')}
            />
            <OrderTypeCard
              title="Take Away"
              description="Get your food packed for takeaway"
              icon={Package}
              emoji="🥡"
              color="green"
              onClick={() => handleOrderType('take-away')}
            />
            <OrderTypeCard
              title="Staff Delivery"
              description="Delivery to your department (Staff only)"
              icon={Truck}
              emoji="🏫"
              color="purple"
              onClick={() => handleOrderType('staff-delivery')}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Fast, Easy &amp; Convenient
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="feature-card text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">Easy Ordering</h3>
              <p className="text-muted-foreground">Simple and quick menu selection with beautiful interface</p>
            </div>

            <div className="feature-card text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Ticket className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">Token System</h3>
              <p className="text-muted-foreground">Track your order with unique token number</p>
            </div>

            <div className="feature-card text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-10 h-10 text-success" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">Live Updates</h3>
              <p className="text-muted-foreground">Real-time order status tracking on display</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <ReviewsSection onViewAll={() => navigate('/reviews')} />

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 Campus Canteen. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Inline Reviews Preview Section ───────────────────────────────────────────
function ReviewsSection({ onViewAll }: { onViewAll: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    fetchAllReviews().then((data) => {
      setReviews(data.slice(0, 3));
      if (data.length) {
        setAvg(data.reduce((s, r) => s + r.rating, 0) / data.length);
      }
    });
  }, []);

  const ratingColors: Record<number, string> = {
    1: 'text-red-500',
    2: 'text-orange-400',
    3: 'text-yellow-500',
    4: 'text-lime-500',
    5: 'text-emerald-500',
  };
  const ratingLabels: Record<number, string> = {
    1: 'Poor 😞',
    2: 'Fair 😐',
    3: 'Good 🙂',
    4: 'Great 😊',
    5: 'Excellent 🤩',
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            What Our Customers Say
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Customer Reviews
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${s <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                />
              ))}
              <span className="text-foreground font-bold ml-2">{avg.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">/ 5</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-foreground">No reviews yet</p>
            <p className="text-sm mt-1">Place an order and be the first to review!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow animate-fade-in"
                >
                  {/* Stars row */}
                  <div className="flex items-center gap-0.5 flex-wrap">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25'}`}
                      />
                    ))}
                    <span className={`ml-1.5 text-xs font-semibold ${ratingColors[review.rating]}`}>
                      {ratingLabels[review.rating]}
                    </span>
                  </div>

                  {/* Comment */}
                  {review.comment ? (
                    <p className="text-sm text-foreground/80 leading-relaxed flex-1 line-clamp-3">
                      "{review.comment}"
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic flex-1">No comment provided.</p>
                  )}

                  {/* Customer row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        {review.customerName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All CTA */}
            <div className="text-center">
              <button
                id="view-all-reviews-btn"
                onClick={onViewAll}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-2xl hover:brightness-110 transition-all shadow-lg"
                style={{ boxShadow: 'var(--shadow-primary)' }}
              >
                View All Reviews
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
