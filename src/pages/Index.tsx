import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Package, Truck, Sparkles, Clock, Ticket } from 'lucide-react';
import OrderTypeCard from '@/components/OrderTypeCard';
import heroImage from '@/assets/hero-food.jpg';
import { setOrderType } from '@/lib/store';

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
        {/* Background with overlay */}
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
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-white/90 text-sm font-medium">Fresh & Delicious</span>
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
              Fast, Easy & Convenient
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

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 Campus Canteen. Made with ❤️ for students & staff.
          </p>
        </div>
      </footer>
    </div>
  );
}
