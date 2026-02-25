import { Link, useLocation } from 'react-router-dom';
import { Home, Monitor, ShoppingCart, User, UtensilsCrossed, Search } from 'lucide-react';
import { getCart } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function Header() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, [location.pathname]);

  const isDisplayPage = location.pathname === '/display';
  const isStaffPage = location.pathname.startsWith('/staff');

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (isDisplayPage) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 text-foreground group">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight hidden sm:inline">Campus Canteen</span>
            </Link>
          </div>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center justify-center gap-1 bg-muted/50 p-1.5 rounded-2xl">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              to="/menu"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/menu')
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <UtensilsCrossed className="h-4 w-4" />
              Menu
            </Link>
            <Link
              to="/display"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/display')
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Monitor className="h-4 w-4" />
              Display
            </Link>
            <Link
              to="/track"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/track')
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Search className="h-4 w-4" />
              Track
            </Link>
            <Link
              to="/staff/login"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/staff')
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <User className="h-4 w-4" />
              Staff
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center justify-end gap-2">
            {/* Mobile: show only Staff + Cart */}
            <Link
              to="/staff/login"
              className="md:hidden inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4" />
            </Link>

            {!isStaffPage && (
              <Link
                to="/cart"
                className="relative inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all duration-200"
                style={{ boxShadow: 'var(--shadow-primary)' }}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-secondary text-secondary-foreground text-xs font-bold min-w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-background animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
