import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Monitor,
  ShoppingCart,
  User,
  UtensilsCrossed,
  Search,
  Package,
  TrendingUp,
  Tag,
  ShieldCheck,
  ChevronDown,
  ChefHat,
} from 'lucide-react';
import { getCart } from '@/lib/store';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check initial session
    if (typeof window !== 'undefined') {
      const isLocalAdmin = localStorage.getItem('local_admin') === 'true' || sessionStorage.getItem('local_admin') === 'true';
      const isLocalStaff = localStorage.getItem('local_staff') === 'true' || sessionStorage.getItem('local_staff') === 'true';

      if (isLocalAdmin) {
        setUser({
          user_metadata: { full_name: 'Avanish' },
          email: 'avanishshukla234@gmail.com',
        });
      } else if (isLocalStaff) {
        setUser({
          user_metadata: { full_name: 'Avanish Staff' },
          email: 'avanish.v.shukla@slrtce.in',
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
        const isLocalAdmin = localStorage.getItem('local_admin') === 'true' || sessionStorage.getItem('local_admin') === 'true';
        const isLocalStaff = localStorage.getItem('local_staff') === 'true' || sessionStorage.getItem('local_staff') === 'true';

        if (isLocalAdmin) {
          setUser({
            user_metadata: { full_name: 'Avanish' },
            email: 'avanishshukla234@gmail.com',
          });
        } else if (isLocalStaff) {
          setUser({
            user_metadata: { full_name: 'Avanish Staff' },
            email: 'avanish.v.shukla@slrtce.in',
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
  const isAdminPage = location.pathname.startsWith('/admin');

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (isDisplayPage) return null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Brand Logo & Name */}
            <Link to="/" className="flex items-center gap-2.5 text-foreground group flex-shrink-0">
              <Logo size="sm" />
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold tracking-tight leading-none">
                  Campus Canteen
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:block">
                  Grab & Go Fast Order
                </span>
              </div>
            </Link>

            {/* Clean Center Navigation — Desktop Only (No overlapping!) */}
            <nav className="hidden md:flex items-center justify-center gap-1 bg-muted/60 p-1 rounded-2xl flex-shrink-0">
              <Link
                to="/"
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive('/')
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                Home
              </Link>
              <Link
                to="/menu"
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive('/menu')
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <UtensilsCrossed className="h-3.5 w-3.5" />
                Menu
              </Link>
              <Link
                to="/track"
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive('/track')
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                Track
              </Link>
              <Link
                to="/display"
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive('/display')
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                Display
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
              {/* Admin Portal Dropdown (for Admin / Staff users) */}
              {(role === 'admin' || role === 'staff') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all border ${
                        isAdminPage || isStaffPage
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Admin Tools</span>
                      <ChevronDown className="h-3 w-3 opacity-70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl shadow-xl border border-border bg-card">
                    <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground px-2 py-1">
                      Canteen Management
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/menu" className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted">
                        <UtensilsCrossed className="w-4 h-4 text-primary" />
                        <span>Menu & Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/inventory" className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted">
                        <Package className="w-4 h-4 text-emerald-500" />
                        <span>Inventory Control</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/analytics" className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span>Sales Analytics</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/coupons" className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted">
                        <Tag className="w-4 h-4 text-purple-500" />
                        <span>Coupons & Promos</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem asChild>
                      <Link to="/staff/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-amber-600 rounded-xl cursor-pointer hover:bg-amber-500/10">
                        <ChefHat className="w-4 h-4" />
                        <span>Kitchen Display (Queue)</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <NotificationBell />

              {/* Profile button */}
              {user ? (
                <button
                  onClick={() => (window.location.href = '/profile')}
                  className="flex items-center gap-1.5 rounded-xl px-1.5 py-1 hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(user.user_metadata?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col items-start text-left">
                    <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[100px]">
                      {user.user_metadata?.full_name || 'User'}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight truncate max-w-[120px]">
                      {user.email}
                    </span>
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}

              {/* Cart Button */}
              {!isStaffPage && (
                <Link
                  to="/cart"
                  className="relative inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110 active:scale-95 transition-all duration-200"
                  style={{ boxShadow: 'var(--shadow-primary)' }}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-secondary text-secondary-foreground text-[10px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 border-background animate-scale-in">
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
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/80 safe-area-inset-bottom"
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
                isActive('/profile') || isActive('/login') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <User className={`h-5 w-5 ${isActive('/profile') || isActive('/login') ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium">{user ? 'Profile' : 'Login'}</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
