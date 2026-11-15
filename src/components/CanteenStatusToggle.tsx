import React, { useState } from 'react';
import {
  Store,
  Clock,
  CheckCircle2,
  Coffee,
  AlertCircle,
  Sparkles,
  UtensilsCrossed,
  ChefHat,
  RefreshCw,
} from 'lucide-react';
import { useKitchenStatus, setCanteenStatus } from '@/lib/kitchen-status';
import { toast } from 'sonner';

interface CanteenStatusToggleProps {
  className?: string;
  compact?: boolean;
}

const PRESET_REASONS = [
  'Canteen closed for today. Reopening tomorrow at 8:00 AM.',
  'Taking a 30-min kitchen prep break. Orders will resume shortly.',
  'Daily stock finished for today. Thank you for visiting!',
  'Kitchen maintenance & counter cleaning in progress.',
];

export default function CanteenStatusToggle({ className = '', compact = false }: CanteenStatusToggleProps) {
  const status = useKitchenStatus();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reasonInput, setReasonInput] = useState('');

  const handleOpenClick = async () => {
    setIsUpdating(true);
    try {
      const res = await setCanteenStatus(true, 'Canteen is open for orders');
      if (res.success) {
        toast.success('Canteen is now OPEN! Students can place orders.');
      } else {
        toast.error('Failed to open canteen: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseClick = () => {
    setReasonInput(PRESET_REASONS[0]);
    setShowConfirmModal(true);
  };

  const handleConfirmClose = async () => {
    setIsUpdating(true);
    try {
      const finalReason = reasonInput.trim() || 'Canteen is closed for today. Kitchen not accepting orders.';
      const res = await setCanteenStatus(false, finalReason);
      if (res.success) {
        toast.success('Canteen is now CLOSED. New orders paused across the campus.');
      } else {
        toast.error('Failed to close canteen: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsUpdating(false);
      setShowConfirmModal(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={() => (status.isOpen ? handleCloseClick() : handleOpenClick())}
        disabled={isUpdating}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
          status.isOpen
            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
        } ${className}`}
        title={status.isOpen ? 'Click to Pause Orders' : 'Click to Open Canteen'}
      >
        <Store className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
        <span>{status.isOpen ? 'Canteen: Open' : 'Canteen: Closed'}</span>
      </button>
    );
  }

  return (
    <>
      {/* ── Authentic Canteen Staff Control Card ────────────────────── */}
      <div
        className={`bg-card rounded-2xl border transition-all p-3.5 sm:p-4 shadow-xs ${
          status.isOpen
            ? 'border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-card to-card'
            : 'border-amber-500/40 dark:border-amber-500/25 bg-gradient-to-r from-amber-500/5 via-card to-card'
        } ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          {/* Left: Canteen Counter Details */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform ${
                status.isOpen
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              }`}
            >
              {status.isOpen ? (
                <ChefHat className="w-5 h-5" />
              ) : (
                <Coffee className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
                  Canteen Counter Status
                </span>
                {status.isOpen ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Open • Taking Orders
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Closed • Orders Paused
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {status.isOpen ? (
                  'Kitchen is actively accepting Dine-in, Takeaway & Faculty delivery orders.'
                ) : (
                  <span>
                    Notice: <strong className="text-foreground font-medium">"{status.closedReason || 'Canteen closed for today'}"</strong>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Clean Action Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {status.isOpen ? (
              <button
                type="button"
                onClick={handleCloseClick}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 border border-border/80 hover:border-rose-300 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-2xs"
                title="Pause new orders when kitchen is full or closing"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Pause Orders (Close Canteen)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenClick}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-sm cursor-pointer active:scale-95"
                title="Reopen kitchen and resume accepting orders"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isUpdating ? 'Opening...' : 'Open Canteen & Accept Orders'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Closing Confirmation Dialog ──────────────────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Pause Canteen Ordering?
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Students will still be able to browse the menu and rates, but Add-to-Cart and Checkouts will be paused until you reopen.
                </p>
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Select quick reason for notice:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_REASONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setReasonInput(preset)}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      reasonInput === preset
                        ? 'border-primary bg-primary/10 text-foreground font-bold shadow-2xs'
                        : 'border-border/70 hover:border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom reason input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">
                Or custom notice message:
              </label>
              <input
                type="text"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g. Taking a 30-min break for food prep..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs cursor-pointer active:scale-95"
              >
                {isUpdating ? 'Pausing...' : 'Confirm & Close Canteen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
