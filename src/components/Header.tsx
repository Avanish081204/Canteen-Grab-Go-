import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Percent,
  LogOut,
  Clock,
} from 'lucide-react';
import { getCart } from '@/lib/store';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
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
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check initial session
    if (typeof window !== 'undefined') {
      const isLocalAdmin =
        localStorage.getItem('local_admin') === 'true' ||
        sessionStorage.getItem('local_admin') === 'true';
      const isLocalStaff =
        localStorage.getItem('local_staff') === 'true' ||
        sessionStorage.getItem('local_staff') === 'true';

      if (isLocalAdmin) {
        setUser({
          user_metadata: { full_name: 'Avanish Shukla' },
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (typeof window !== 'undefined') {
        const isLocalAdmin =
          localStorage.getItem('local_admin') === 'true' ||
          sessionStorage.getItem('local_admin') === 'true';
        const isLocalStaff =
          localStorage.getItem('local_staff') === 'true' ||
          sessionStorage.getItem('local_staff') === 'true';

        if (isLocalAdmin) {
          setUser({
            user_metadata: { full_name: 'Avanish Shukla' },
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

  const handleSignOut = async () => {
    localStorage.removeItem('local_admin');
    sessionStorage.removeItem('local_admin');
    localStorage.removeItem('local_staff');
    sessionStorage.removeItem('local_staff');
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    window.dispatchEvent(new Event('userLoggedOut'));
    navigate('/');
  };

  if (isDisplayPage) return null;

  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-3 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* ── Brand Logo ────────────────────────────────────────── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 text-foreground group flex-shrink-0"
            >
              <Logo size="sm" />
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black tracking-tight leading-none text-foreground">
                  Campus Canteen
                </span>
                <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">
                  SLRTCE Smart Food Court
                </span>
              </div>
            </Link>

            {/* ── Minimalist Clean Center Navigation (Desktop) ──────── */}
            <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
              <Link
                to="/"
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isActive('/')
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                Home
              </Link>
              <Link
                to="/offers"
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isActive('/offers')
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Percent className="h-3.5 w-3.5 text-amber-500" />
                Offers &amp; Deals
              </Link>
              <Link
                to="/track"
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isActive('/track')
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                Track Order
              </Link>
              <Link
                to="/display"
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isActive('/display')
                    ? 'bg-foreground text-background shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                TV Display
              </Link>
            </nav>

            {/* ── Right Actions: Clean, Balanced, Uncluttered ────────── */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              {/* Theme & Notifications */}
              <ThemeToggle />
              <NotificationBell />

              {/* User Avatar with Unified Dropdown (Replaces clutter!) */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-1.5 p-1 rounded-full hover:bg-muted/80 transition-all focus:outline-none"
                      title="Account & Portal"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center text-xs font-extrabold shadow-xs">
                        {initials}
                      </div>
                      <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 p-2 rounded-2xl shadow-2xl border border-border bg-card"
                  >
                    {/* User Info Header */}
                    <div className="px-2.5 py-2">
                      <p className="text-xs font-black text-foreground truncate">
                        {user.user_metadata?.full_name || 'Campus Student'}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/50">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Coins className="w-3 h-3" />
                          <span>Loyalty Coins</span>
                        </span>
                        {role === 'admin' && (
                          <span className="text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
                            Admin
                          </span>
                        )}
                        {role === 'staff' && (
                          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Kitchen Staff
                          </span>
                        )}
                      </div>
                    </div>

                    <DropdownMenuSeparator className="my-1" />

                    {/* Standard User Links */}
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted"
                      >
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span>Profile &amp; Coin History</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        to="/track"
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted"
                      >
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>My Active Token Orders</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Admin / Staff Management Section */}
                    {(role === 'admin' || role === 'staff') && (
                      <>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2.5 py-1">
                          Management Tools
                        </DropdownMenuLabel>

                        <DropdownMenuItem asChild>
                          <Link
                            to="/admin/menu"
                            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
                            <span>Menu &amp; Dish Control</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            to="/admin/inventory"
                            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted"
                          >
                            <Package className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Stock Inventory</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            to="/admin/analytics"
                            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted"
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                            <span>Sales &amp; Analytics</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            to="/admin/coupons"
                            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted"
                          >
                            <Tag className="w-3.5 h-3.5 text-purple-500" />
                            <span>Manage Promo Coupons</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            to="/admin/users"
                            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted"
                          >
                            <Users className="w-3.5 h-3.5 text-cyan-500" />
                            <span>Accounts &amp; Roles</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            to="/staff/dashboard"
                            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 rounded-xl cursor-pointer hover:bg-amber-500/10"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Kitchen Order Queue</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator className="my-1" />

                    {/* Log Out */}
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-xl cursor-pointer hover:bg-rose-500/10"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Login</span>
                </Link>
              )}

              {/* Sleek Gourmet Cart Pill */}
              {!isStaffPage && (
                <Link
                  to="/cart"
                  className="relative inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 text-xs font-black shadow-xs active:scale-95 transition-all"
                >
                  <ShoppingCart className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-secondary text-secondary-foreground text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center border border-background">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Modern Floating Island Mobile Bottom Navigation ──────── */}
      {!isStaffPage && (
        <nav className="md:hidden fixed bottom-2 left-3 right-3 z-50 bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl safe-area-inset-bottom shadow-2xl shadow-black/10">
          <div className="flex items-center justify-around px-1 py-1.5">
            <Link
              to="/"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive('/')
                  ? 'text-primary font-bold scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className={`h-4 w-4 ${isActive('/') ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">Home</span>
            </Link>

            <Link
              to="/offers"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive('/offers')
                  ? 'text-primary font-bold scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Percent className={`h-4 w-4 ${isActive('/offers') ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">Offers</span>
            </Link>

            <Link
              to="/track"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive('/track')
                  ? 'text-primary font-bold scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Search className={`h-4 w-4 ${isActive('/track') ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">Track</span>
            </Link>

            <Link
              to="/cart"
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive('/cart')
                  ? 'text-primary font-bold scale-105'
                  : 'text-muted-foreground hover:text-foreground'
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
                isActive('/profile') || isActive('/login')
                  ? 'text-primary font-bold scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User
                className={`h-4 w-4 ${
                  isActive('/profile') || isActive('/login') ? 'stroke-[2.5]' : ''
                }`}
              />
              <span className="text-[10px]">{user ? 'Profile' : 'Login'}</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
