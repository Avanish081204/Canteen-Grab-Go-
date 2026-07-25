import { Link, useLocation } from 'react-router-dom';
import { Home, Monitor, ShoppingCart, User, UtensilsCrossed, Search, Menu, X } from 'lucide-react';
import { getCart } from '@/lib/store';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import Logo from './Logo';

export default function Header() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check initial session
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('local_admin') === 'true') {
        setUser({
          user_metadata: { full_name: 'Avanish' },
          email: 'avanishshukla234@gmail.com'
        });
      } else if (sessionStorage.getItem('local_staff') === 'true') {
        setUser({
          user_metadata: { full_name: 'Avanish Staff' },
          email: 'avanish.v.shukla@slrtce.in'
        });
      } else {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null);
        });
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (typeof window !== 'undefined') {
        if (sessionStorage.getItem('local_admin') === 'true') {
          setUser({
            user_metadata: { full_name: 'Avanish' },
            email: 'avanishshukla234@gmail.com'
          });
        } else if (sessionStorage.getItem('local_staff') === 'true') {
          setUser({
            user_metadata: { full_name: 'Avanish Staff' },
            email: 'avanish.v.shukla@slrtce.in'
          });
        } else {
          setUser(session?.user ?? null);
        }
      }
    });

    const updateCartCount = () => {
      const cart = getCart();
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    
    const handleLogout = () => {
      setUser(null);
    };
    window.addEventListener('userLoggedOut', handleLogout);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('userLoggedOut', handleLogout);
      subscription.unsubscribe();
    };
  }, []);



  const { role } = useProfile();

  const isDisplayPage = location.pathname === '/display';
  const isStaffPage = location.pathname.startsWith('/staff');

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (isDisplayPage) return null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 text-foreground group flex-shrink-0">
              <Logo size="sm" />
              <span className="text-sm sm:text-lg font-bold tracking-tight">Campus Canteen</span>
            </Link>

            {/* Center Nav — desktop only */}
            <nav className="hidden md:flex items-center justify-center gap-1 bg-muted/50 p-1.5 rounded-2xl flex-1 max-w-2xl">
              <Link
                to="/"
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
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
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
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
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
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
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive('/track')
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Search className="h-4 w-4" />
                Track
              </Link>

              {(role === 'staff' || role === 'admin') && (
                <Link
                  to="/staff/dashboard"
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive('/staff/dashboard')
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Staff
                </Link>
              )}

              {role === 'admin' && (
                <Link
                  to="/admin/menu"
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive('/admin/menu')
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(user.user_metadata?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-xs font-semibold text-foreground leading-tight">
                      {user.user_metadata?.full_name || 'User'}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {user.email}
                    </span>
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}

              {!isStaffPage && (
                <Link
                  to="/cart"
                  className="relative inline-flex items-center gap-2 rounded-2xl bg-primary px-3 sm:px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all duration-200"
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

      {/* Mobile Bottom Navigation */}
      {!isStaffPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/80 safe-area-inset-bottom"
          style={{ boxShadow: '0 -4px 20px -4px hsl(20 20% 12% / 0.1)' }}
        >
          <div className="flex items-center justify-around px-2 py-2">
            <Link
              to="/"
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Home className={`h-5 w-5 ${isActive('/') ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium">Home</span>
            </Link>

            <Link
              to="/menu"
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive('/menu') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <UtensilsCrossed className={`h-5 w-5 ${isActive('/menu') ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium">Menu</span>
            </Link>

            <Link
              to="/track"
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive('/track') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Search className={`h-5 w-5 ${isActive('/track') ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium">Track</span>
            </Link>

            <Link
              to="/cart"
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive('/cart') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <ShoppingCart className={`h-5 w-5 ${isActive('/cart') ? 'fill-primary/20' : ''}`} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 right-1.5 bg-primary text-primary-foreground text-[9px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="text-[10px] font-medium">Cart</span>
            </Link>

            <Link
              to={user ? '/profile' : '/login'}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                (isActive('/profile') || isActive('/login')) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <User className={`h-5 w-5 ${(isActive('/profile') || isActive('/login')) ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium">{user ? 'Profile' : 'Login'}</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
