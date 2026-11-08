import { Plus, Minus, Trash2, Flame } from 'lucide-react';
import { CartItem, updateCartQuantity, removeFromCart } from '@/lib/store';

interface CartItemCardProps {
  item: CartItem;
  onUpdate: () => void;
}

export default function CartItemCard({ item, onUpdate }: CartItemCardProps) {
  const itemIdentifier = item.cartItemId || item.id;
  const unitPrice = item.customizedPrice ?? item.price;
  const totalPrice = unitPrice * item.quantity;

  const handleIncrease = () => {
    updateCartQuantity(itemIdentifier, item.quantity + 1);
    onUpdate();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleDecrease = () => {
    updateCartQuantity(itemIdentifier, item.quantity - 1);
    onUpdate();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemove = () => {
    removeFromCart(itemIdentifier);
    onUpdate();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="flex items-start gap-2.5 sm:gap-4 p-3 sm:p-4 bg-card rounded-2xl shadow-sm border border-border animate-slide-up">
      {/* Item Thumbnail */}
      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border/50">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0 pr-1">
        <h3 className="font-bold text-xs sm:text-base text-card-foreground truncate">{item.name}</h3>
        <p className="text-xs sm:text-sm font-black text-primary mt-0.5">₹{unitPrice}</p>

        {/* Customization Details (Spice, Addons, Notes) */}
        {item.customizations && (
          <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
            {item.customizations.spiceLevel && (
              <span className="inline-flex items-center gap-0.5 text-orange-600 dark:text-orange-400 font-semibold mr-2">
                <Flame className="w-2.5 h-2.5" />
                {item.customizations.spiceLevel}
              </span>
            )}
            {item.customizations.addons && item.customizations.addons.length > 0 && (
              <p className="line-clamp-1 font-medium text-foreground/80">
                + {item.customizations.addons.map(a => a.name).join(', ')}
              </p>
            )}
            {item.customizations.instructions && (
              <p className="italic text-muted-foreground line-clamp-1">
                Note: "{item.customizations.instructions}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Item Controls & Total Price */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <p className="font-extrabold text-xs sm:text-base text-foreground">₹{totalPrice}</p>
        
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/80 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-border/60">
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
