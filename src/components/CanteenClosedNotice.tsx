import React from 'react';
import { Store, Clock, Coffee, MapPin, Sparkles } from 'lucide-react';
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
        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs ${className}`}
      >
        <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-bold">Canteen Orders Paused: </span>
          <span className="text-muted-foreground truncate">
            {status.closedReason || 'Kitchen is currently not accepting new orders.'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-amber-500/35 bg-gradient-to-br from-amber-500/10 via-card to-orange-500/5 p-4 sm:p-5 shadow-xs overflow-hidden relative ${className}`}
    >
      <div className="flex items-start gap-3.5">
        {/* Warm Canteen Shop/Chef Icon */}
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-2xs">
          <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
              Canteen is Currently Closed
            </h4>
            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-500/30">
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
              'The kitchen is currently not accepting orders. You can still browse the full menu, check rates, and discover combo deals!'
            )}
          </p>

          {/* Canteen Campus Info Chips */}
          <div className="flex items-center gap-2.5 pt-1 text-[11px] text-muted-foreground flex-wrap font-medium">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Hours: Mon–Sat, 8:00 AM – 6:30 PM</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" />
              <span>Ground Floor Food Court</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Menu Browsing Available</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

