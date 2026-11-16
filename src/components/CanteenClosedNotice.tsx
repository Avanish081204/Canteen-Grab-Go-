import React from 'react';
import { Store, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useKitchenStatus } from '@/lib/kitchen-status';

interface CanteenClosedNoticeProps {
  className?: string;
  compact?: boolean;
}

export default function CanteenClosedNotice({ className = '', compact = false }: CanteenClosedNoticeProps) {
  const status = useKitchenStatus();

  if (status.isOpen) return null;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs ${className}`}
      >
        <Store className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-bold">Orders Paused: </span>
          <span className="text-muted-foreground truncate">
            {status.closedReason || 'Kitchen is currently not accepting new orders.'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-border/80 border-l-4 border-l-amber-500 bg-card p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* Sleek Professional Storefront Badge (Replaces emoji-like icon) */}
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
          <Store className="w-5 h-5 stroke-[1.8]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
              Canteen is Currently Closed
            </h4>
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Orders Paused
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {status.closedReason ? (
              <>
                <strong className="text-foreground font-semibold">Staff Notice: </strong>
                <span>"{status.closedReason}"</span>
              </>
            ) : (
              'The kitchen is currently taking a break and not accepting orders. You can still browse the full menu, check rates, and discover combo deals!'
            )}
          </p>

          {/* Clean Canteen Campus Chips (Non-contradictory) */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground flex-wrap font-medium">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>SLRTCE Ground Floor Food Court</span>
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Menu &amp; Rates Available to Browse</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
