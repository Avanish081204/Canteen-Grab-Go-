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
    toast.success(`${item.name} added to cart!`);
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
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {item.isCombo && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-secondary to-amber-500 text-secondary-foreground px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <Star className="w-3 h-3" />
            COMBO
          </div>
        )}
        {item.isAvailable && item.dietary && (
          <div className="absolute top-3 right-3 z-10">
            <div className={`w-6 h-6 bg-white rounded-md border-2 ${item.dietary === 'veg' ? 'border-green-600' : 'border-red-600'} flex items-center justify-center shadow-md`}>
              <div className={`w-3 h-3 rounded-full ${item.dietary === 'veg' ? 'bg-green-600' : 'bg-red-600'}`} />
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-card-foreground mb-1.5 line-clamp-1">{item.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
        
        <div className="flex items-center justify-between gap-3">
          <span className="text-2xl font-bold text-primary">₹{item.price}</span>
          
          {item.isAvailable && (
            quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="btn-gold flex items-center gap-2 text-sm !px-5 !py-2.5 !rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-muted rounded-2xl p-1.5">
                <button
                  onClick={handleDecrease}
                  className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 transition-all duration-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
