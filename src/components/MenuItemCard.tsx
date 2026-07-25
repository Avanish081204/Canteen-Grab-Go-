import { Plus, Minus, Star } from 'lucide-react';
import { MenuItem, addToCart, getCart, updateCartQuantity } from '@/lib/store';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface MenuItemCardProps {
  item: MenuItem;
  onCartUpdate: () => void;
}

export default function MenuItemCard({ item, onCartUpdate }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const cart = getCart();
    const cartItem = cart.find(i => i.id === item.id);
    setQuantity(cartItem?.quantity || 0);
  }, [item.id]);

  const handleAdd = () => {
    addToCart(item);
    setQuantity(prev => prev + 1);
    onCartUpdate();
    toast.success(`${item.name} added!`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleIncrease = () => {
    const newQty = quantity + 1;
    updateCartQuantity(item.id, newQty);
    setQuantity(newQty);
    onCartUpdate();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleDecrease = () => {
    const newQty = quantity - 1;
    updateCartQuantity(item.id, newQty);
    setQuantity(newQty);
    onCartUpdate();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className={`card-menu animate-fade-in ${!item.isAvailable ? 'opacity-60 grayscale' : ''}`}>
      {/* Image container - compact height on mobile */}
      <div className="relative h-28 sm:h-36 md:h-44 w-full bg-muted overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.isCombo && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-secondary to-amber-500 text-secondary-foreground px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold flex items-center gap-1 shadow-md">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            COMBO
          </div>
        )}
        {item.isAvailable && item.dietary && (
          <div className="absolute top-2 right-2 z-10">
            <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded border-2 ${item.dietary === 'veg' ? 'border-green-600' : 'border-red-600'} flex items-center justify-center shadow-sm`}>
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${item.dietary === 'veg' ? 'bg-green-600' : 'bg-red-600'}`} />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-4">
        <h3 className="font-bold text-xs sm:text-base text-card-foreground mb-0.5 line-clamp-1 capitalize">{item.name}</h3>
        <p className="text-muted-foreground text-[11px] sm:text-xs mb-2 line-clamp-1 h-4">{item.description}</p>
        
        <div className="flex items-center justify-between gap-1.5 pt-1">
          <span className="text-sm sm:text-lg font-extrabold text-primary">₹{item.price}</span>
          
          {item.isAvailable && (
            quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="bg-gradient-to-r from-secondary to-amber-500 text-secondary-foreground font-bold text-xs sm:text-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl shadow hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Add
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-muted rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                <button
                  onClick={handleDecrease}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 sm:w-7 text-center font-bold text-xs sm:text-sm">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
