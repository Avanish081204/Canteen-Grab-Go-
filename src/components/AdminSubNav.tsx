import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, UtensilsCrossed, Package, TrendingUp, Tag, ChefHat, Sparkles, Users } from 'lucide-react';
import React from 'react';

interface AdminSubNavProps {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode; // Right action buttons (e.g. "+ New Coupon", "+ Add Item")
}

export default function AdminSubNav({ title, icon, children }: AdminSubNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/menu', label: 'Menu & Orders', icon: UtensilsCrossed },
    { path: '/admin/inventory', label: 'Inventory', icon: Package },
    { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/admin/coupons', label: 'Coupons', icon: Tag },
    { path: '/admin/users', label: 'Users & Roles', icon: Users },
    { path: '/staff/dashboard', label: 'Kitchen Display', icon: ChefHat },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-xs">
      <div className="container mx-auto px-3 sm:px-4 py-2.5">
        {/* Top line: Back, Title & Actions */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors flex-shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="h-4 w-px bg-border flex-shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              {icon && <span className="text-primary flex-shrink-0">{icon}</span>}
              <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">{title}</h1>
            </div>
          </div>

          {/* Right Action buttons */}
          {children && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {children}
            </div>
          )}
        </div>

        {/* Bottom line: Admin Tool Pills (Scrollable on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

