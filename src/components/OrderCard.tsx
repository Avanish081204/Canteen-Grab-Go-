import { Clock, ChefHat, CheckCircle, Truck, Package, PackageCheck, Download } from 'lucide-react';
import { Order, OrderStatus, updateOrderStatus } from '@/lib/store';
import { toast } from 'sonner';
import { downloadBill } from '@/lib/bill-utils';

interface OrderCardProps {
  order: Order;
  onStatusUpdate: () => void;
  isStaff?: boolean;
}

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; class: string }> = {
  placed: { label: 'New Order', icon: Clock, class: 'status-placed' },
  cooking: { label: 'Cooking', icon: ChefHat, class: 'status-cooking' },
  ready: { label: 'Ready', icon: CheckCircle, class: 'status-ready' },
  collected: { label: 'Collected', icon: PackageCheck, class: 'status-collected' },
  'out-for-delivery': { label: 'Out for Delivery', icon: Truck, class: 'status-delivery' },
  delivered: { label: 'Delivered', icon: Package, class: 'status-delivered' },
};

const tokenClasses: Record<string, string> = {
  'dine-in': 'token-dine-in',
  'take-away': 'token-takeaway',
  'staff-delivery': 'token-delivery',
};

export default function OrderCard({ order, onStatusUpdate, isStaff = false }: OrderCardProps) {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      onStatusUpdate();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update status');
    }
  };

  const handleDownloadBill = () => {
    downloadBill(order);
  };

  const getNextStatusButton = () => {
    if (order.type === 'staff-delivery') {
      switch (order.status) {
        case 'placed': return { label: '🍳 Start Cooking', status: 'cooking' as OrderStatus };
        case 'cooking': return { label: '✅ Mark Ready', status: 'ready' as OrderStatus };
        case 'ready': return { label: '🚚 Out for Delivery', status: 'out-for-delivery' as OrderStatus };
        case 'out-for-delivery': return { label: '📦 Delivered', status: 'delivered' as OrderStatus };
        default: return null;
      }
    }

    switch (order.status) {
      case 'placed': return { label: '🍳 Start Cooking', status: 'cooking' as OrderStatus };
      case 'cooking': return { label: '✅ Mark Ready', status: 'ready' as OrderStatus };
      case 'ready': return { label: '✓ Mark Collected', status: 'collected' as OrderStatus };
      default: return null;
    }
  };

  const nextStatus = getNextStatusButton();

  return (
    <div className="order-card animate-fade-in relative group rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-border/60 bg-muted/20">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Token badge — prevent multi-line wrap */}
          <div className={`token-badge !text-xs sm:!text-sm !font-mono !tracking-tight !px-3 !py-1.5 !rounded-xl ${tokenClasses[order.type]} whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-none`}>
            {order.token}
          </div>

          <div className="flex items-center gap-2">
            <div className={`status-badge ${config.class}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{config.label}</span>
            </div>

            {/* Download Bill Button */}
            {isStaff && (
              <button
                onClick={handleDownloadBill}
                className="p-1.5 rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-primary transition-all shadow-sm border border-border"
                title="Download Bill"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 sm:p-4">
        {/* Items */}
        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-foreground font-medium truncate pr-2">
                {item.quantity}× {item.name}
              </span>
              <span className="text-muted-foreground flex-shrink-0 font-semibold">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-border/50 pt-3 flex justify-between items-center">
          <span className="font-semibold text-xs sm:text-sm text-foreground">Total</span>
          <span className="text-base sm:text-lg font-extrabold text-primary">₹{order.total}</span>
        </div>

        {/* Staff Delivery Details */}
        {order.type === 'staff-delivery' && isStaff && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5 text-xs bg-muted/40 rounded-xl p-3">
            {order.customerName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{order.customerName}</span>
              </div>
            )}
            {order.customerPhone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-foreground">{order.customerPhone}</span>
              </div>
            )}
            {order.department && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dept</span>
                <span className="font-medium text-foreground">{order.department}</span>
              </div>
            )}
            {order.location && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-foreground">{order.location}</span>
              </div>
            )}
            {order.timeSlot && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slot</span>
                <span className="font-medium text-foreground">{order.timeSlot}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {isStaff && nextStatus && (
          <button
            onClick={() => handleStatusChange(nextStatus.status)}
            className={`w-full mt-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] ${
              nextStatus.status === 'collected' 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700' 
                : nextStatus.status === 'cooking'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600'
                : nextStatus.status === 'ready'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                : 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:brightness-110'
            }`}
            style={{ boxShadow: '0 4px 12px -2px rgba(0,0,0,0.15)' }}
          >
            {nextStatus.label}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-3.5 pb-3">
        <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
