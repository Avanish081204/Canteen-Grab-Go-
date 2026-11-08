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
  Users,
  Coins,
  Sparkles,
  Percent,
} from 'lucide-react';
import { getCart } from '@/lib/store';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { useKitchenStatus } from '@/lib/kitchen-status';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
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
  const kitchenStatus = useKitchenStatus();

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

            {/* Live Kitchen Rush Indicator */}
            <div
              className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                kitchenStatus.rushLevel === 'low'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  : kitchenStatus.rushLevel === 'moderate'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  kitchenStatus.rushLevel === 'low'
                    ? 'bg-emerald-500'
                    : kitchenStatus.rushLevel === 'moderate'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              <span>
                {kitchenStatus.isOpen
                  ? `Kitchen: ${kitchenStatus.rushLabel} (~${kitchenStatus.estimatedWaitMinutes}m)`
                  : 'Kitchen: Closed (Opens 8 AM)'}
              </span>
            </div>

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
                to="/offers"
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive('/offers')
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Percent className="h-3.5 w-3.5 text-amber-500" />
                Offers &amp; Deals
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
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted">
                        <Users className="w-4 h-4 text-cyan-500" />
                        <span>Users & Staff Roles</span>
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

              <ThemeToggle />
              <NotificationBell />

              {/* VIP Loyalty Coins Shortcut */}
              {user && (
                <Link
                  to="/profile"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-xs"
                  title="View your VIP Loyalty Coins balance"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>Coins</span>
                </Link>
              )}

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

      {/* Modern Floating Island Mobile Bottom Navigation */}
      {!isStaffPage && (
        <nav
          className="md:hidden fixed bottom-2 left-3 right-3 z-50 bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl safe-area-inset-bottom shadow-2xl shadow-black/10"
        >
          <div className="flex items-center justify-around px-1 py-1.5">
            <Link
              to="/"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive('/') ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className={`h-4 w-4 ${isActive('/') ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">Home</span>
            </Link>

            <Link
              to="/offers"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive('/offers') ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Percent className={`h-4 w-4 ${isActive('/offers') ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">Offers</span>
            </Link>

            <Link
              to="/track"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive('/track') ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Search className={`h-4 w-4 ${isActive('/track') ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">Track</span>
            </Link>

            <Link
              to="/cart"
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive('/cart') ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShoppingCart className={`h-4 w-4 ${isActive('/cart') ? 'stroke-[2.5]' : ''}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-0.5 bg-primary text-primary-foreground text-[9px] font-black min-w-[16px] h-[16px] rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                  {cartCount}
                </span>
              )}
              <span className="text-[10px]">Cart</span>
            </Link>

            <Link
              to={user ? '/profile' : '/login'}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive('/profile') || isActive('/login') ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className={`h-4 w-4 ${isActive('/profile') || isActive('/login') ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">{user ? 'Profile' : 'Login'}</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
