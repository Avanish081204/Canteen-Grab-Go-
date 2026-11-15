import React, { useState } from 'react';
import { Power, CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { useKitchenStatus, setCanteenStatus } from '@/lib/kitchen-status';
import { toast } from 'sonner';

interface CanteenStatusToggleProps {
  className?: string;
  compact?: boolean;
}

export default function CanteenStatusToggle({ className = '', compact = false }: CanteenStatusToggleProps) {
  const status = useKitchenStatus();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetState, setTargetState] = useState<boolean>(false);
  const [reasonInput, setReasonInput] = useState('');

  const handleToggleClick = (newOpenState: boolean) => {
    setTargetState(newOpenState);
    if (!newOpenState) {
      // Prompt with reason when closing
      setReasonInput('Canteen closed for today. Kitchen not accepting orders.');
      setShowConfirmModal(true);
    } else {
      // Opening directly
      executeToggle(true, 'Canteen is open for orders');
    }
  };

  const executeToggle = async (newOpenState: boolean, reasonText: string) => {
    setIsUpdating(true);
    try {
      const res = await setCanteenStatus(newOpenState, reasonText);
      if (res.success) {
        if (newOpenState) {
          toast.success('Canteen is now OPEN! Customers can place orders.');
        } else {
          toast.error('Canteen is now CLOSED! New orders are blocked across the app.');
        }
      } else {
        toast.error('Failed to update canteen status: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      toast.error('Error updating status: ' + err.message);
    } finally {
      setIsUpdating(false);
      setShowConfirmModal(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={() => handleToggleClick(!status.isOpen)}
        disabled={isUpdating}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
          status.isOpen
            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
        } ${className}`}
        title={status.isOpen ? 'Click to Close Canteen (Turn OFF)' : 'Click to Open Canteen (Turn ON)'}
      >
        <Power className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
        <span>{status.isOpen ? 'Canteen: OPEN' : 'Canteen: CLOSED'}</span>
      </button>
    );
  }

  return (
    <>
      <div
        className={`flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border transition-all ${
          status.isOpen
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-rose-500/10 border-rose-500/30'
        } ${className}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
              status.isOpen
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-rose-600 text-white shadow-xs animate-pulse'
            }`}
          >
            <Power className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-foreground">
                Canteen Master Switch
              </span>
              <span
                className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  status.isOpen
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-rose-600 text-white shadow-xs'
                }`}
              >
                {status.isOpen ? 'ONLINE • ACCEPTING ORDERS' : 'OFFLINE • ORDERS BLOCKED'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {status.isOpen
                ? 'Customers can browse menu and checkout normally.'
                : status.closedReason || 'Canteen is closed. All add-to-cart and checkouts are blocked.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status.isOpen ? (
            <button
              type="button"
              onClick={() => handleToggleClick(false)}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Power className="w-4 h-4" />
              <span>{isUpdating ? 'Updating...' : 'Turn OFF Canteen'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleToggleClick(true)}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isUpdating ? 'Updating...' : 'Turn ON Canteen'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal when turning OFF */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Turn OFF Canteen?
                </h3>
                <p className="text-xs text-muted-foreground">
                  This will immediately block all new orders across the mobile app and website.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Closing Notice / Reason for Customers:
              </label>
              <input
                type="text"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g. Stock finished for today / Kitchen closed"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeToggle(false, reasonInput.trim() || 'Canteen is currently closed')}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs cursor-pointer"
              >
                {isUpdating ? 'Closing...' : 'Yes, Close Canteen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
