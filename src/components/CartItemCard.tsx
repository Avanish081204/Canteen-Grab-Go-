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
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-sm border border-border animate-slide-up">
      <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-card-foreground truncate">{item.name}</h3>
        <p className="text-primary font-bold">₹{item.price}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          <button
            onClick={handleDecrease}
            className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
          <button
            onClick={handleIncrease}
            className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={handleRemove}
          className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="text-right min-w-[60px]">
        <p className="font-bold text-lg">₹{item.price * item.quantity}</p>
      </div>
    </div>
  );
}
