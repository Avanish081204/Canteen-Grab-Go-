import { Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem, updateCartQuantity, removeFromCart } from '@/lib/store';

interface CartItemCardProps {
  item: CartItem;
  onUpdate: () => void;
}

export default function CartItemCard({ item, onUpdate }: CartItemCardProps) {
  const handleIncrease = () => {
    updateCartQuantity(item.id, item.quantity + 1);
    onUpdate();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleDecrease = () => {
    updateCartQuantity(item.id, item.quantity - 1);
    onUpdate();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemove = () => {
    removeFromCart(item.id);
    onUpdate();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-4 bg-card rounded-2xl shadow-sm border border-border animate-slide-up">
      {/* Item Thumbnail */}
      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border/50">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Item Title & Unit Price */}
      <div className="flex-1 min-w-0 pr-1">
        <h3 className="font-bold text-xs sm:text-base text-card-foreground truncate">{item.name}</h3>
        <p className="text-xs sm:text-sm font-extrabold text-primary mt-0.5">₹{item.price}</p>
      </div>

      {/* Item Controls & Total Price */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <p className="font-extrabold text-xs sm:text-base text-foreground">₹{item.price * item.quantity}</p>
        
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/80 rounded-lg sm:rounded-xl p-0.5 sm:p-1">
            <button
              onClick={handleDecrease}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 sm:w-7 text-center font-bold text-xs sm:text-sm">{item.quantity}</span>
            <button
              onClick={handleIncrease}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 active:scale-95 transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
