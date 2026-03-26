import { Clock, ChefHat, CheckCircle, Truck, Package, PackageCheck } from 'lucide-react';
import { Order, OrderStatus, updateOrderStatus } from '@/lib/store';

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
      // Assuming toast is available in the parent or we can import it. 
      // It's already used in StaffDashboard.
    }
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
      case 'ready': return { label: '✓ Collected', status: 'collected' as OrderStatus };
      default: return null;
    }
  };

  const nextStatus = getNextStatusButton();

  return (
    <div className="order-card animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between gap-3">
          <div className={`token-badge text-lg ${tokenClasses[order.type]}`}>
            {order.token}
          </div>
          <div className={`status-badge ${config.class}`}>
            <StatusIcon className="w-4 h-4" />
            {config.label}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Items */}
        <div className="space-y-2.5 mb-5">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-foreground font-medium">
                {item.quantity}× {item.name}
              </span>
              <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-border/50 pt-4 flex justify-between items-center">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">₹{order.total}</span>
        </div>

        {/* Staff Delivery Details */}
        {order.type === 'staff-delivery' && isStaff && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2 text-sm bg-muted/30 rounded-xl p-4 -mx-1">
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
                <span className="text-muted-foreground">Department</span>
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
                <span className="text-muted-foreground">Time Slot</span>
                <span className="font-medium text-foreground">{order.timeSlot}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {isStaff && nextStatus && (
          <button
            onClick={() => handleStatusChange(nextStatus.status)}
            className={`w-full mt-5 py-3.5 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-[1.02] ${
              nextStatus.status === 'collected' 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700' 
                : nextStatus.status === 'cooking'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600'
                : nextStatus.status === 'ready'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                : 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:brightness-110'
            }`}
            style={{ boxShadow: '0 6px 16px -4px rgba(0,0,0,0.2)' }}
          >
            {nextStatus.label}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <p className="text-xs text-muted-foreground text-center">
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
