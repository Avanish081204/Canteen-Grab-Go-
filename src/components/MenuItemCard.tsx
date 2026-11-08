import { Plus, Minus, Star, Flame, Clock, SlidersHorizontal } from 'lucide-react';
import { MenuItem, addToCart, getCart, updateCartQuantity, CustomizationOption } from '@/lib/store';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ItemCustomizationModal from './ItemCustomizationModal';

interface MenuItemCardProps {
  item: MenuItem;
  onCartUpdate: () => void;
}

export default function MenuItemCard({ item, onCartUpdate }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const cart = getCart();
    // Sum all quantities of this item in the cart (including any customized versions)
    const totalQty = cart
      .filter(i => i.id === item.id)
      .reduce((sum, i) => sum + i.quantity, 0);
    setQuantity(totalQty);
  }, [item.id]);

  const handleAddClick = () => {
    if (item.customizable) {
      setIsModalOpen(true);
    } else {
      addToCart(item);
      setQuantity(prev => prev + 1);
      onCartUpdate();
      toast.success(`${item.name} added to cart!`);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleCustomizationConfirm = (customizations: CustomizationOption, customizedPrice: number) => {
    addToCart(item, customizations, customizedPrice);
    setQuantity(prev => prev + 1);
    onCartUpdate();
    toast.success(`${item.name} (Customized) added!`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleIncrease = () => {
    if (item.customizable) {
      setIsModalOpen(true);
    } else {
      const newQty = quantity + 1;
      updateCartQuantity(item.id, newQty);
      setQuantity(newQty);
      onCartUpdate();
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleDecrease = () => {
    const newQty = quantity - 1;
    updateCartQuantity(item.id, newQty);
    setQuantity(Math.max(0, newQty));
    onCartUpdate();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <>
      <div className={`card-menu group animate-fade-in relative transition-all duration-300 hover:shadow-lg ${!item.isAvailable ? 'opacity-60 grayscale' : ''}`}>
        {/* Image container */}
        <div className="relative h-28 sm:h-36 md:h-44 w-full bg-muted overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges Overlay (Top-Left) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {item.isSpecial && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 shadow-md uppercase tracking-wider">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                Chef's Special
              </div>
            )}
            {item.isCombo && (
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold flex items-center gap-1 shadow-md uppercase tracking-wider">
                Combo Deal
              </div>
            )}
          </div>

          {/* Dietary & Spicy Badges (Top-Right) */}
          {item.isAvailable && (
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
              {item.isSpicy && (
                <span className="bg-background/90 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[10px] shadow-sm flex items-center justify-center border border-border/50" title="Spicy Option">
                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                </span>
              )}
              {item.dietary && (
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded border-2 ${
                    item.dietary === 'veg'
                      ? 'border-green-600'
                      : item.dietary === 'jain'
                      ? 'border-emerald-500'
                      : 'border-red-600'
                  } flex items-center justify-center shadow-sm`}
                  title={item.dietary === 'jain' ? 'Jain Friendly' : item.dietary === 'veg' ? 'Pure Veg' : 'Non-Veg'}
                >
                  {item.dietary === 'jain' ? (
                    <span className="text-[8px] font-black text-emerald-600 leading-none">J</span>
                  ) : (
                    <div
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                        item.dietary === 'veg' ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Prep Time & Calories Pill (Bottom-Left of Image) */}
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1">
            <span className="bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-amber-400" />
              {item.prepTimeMinutes ? `${item.prepTimeMinutes}m` : '6m'}
            </span>
            {item.customizable && (
              <span className="bg-amber-500/90 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-tight">
                Custom
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4">
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <h3 className="font-bold text-xs sm:text-base text-card-foreground line-clamp-1 capitalize">
              {item.name}
            </h3>
          </div>
          <p className="text-muted-foreground text-[11px] sm:text-xs mb-2 line-clamp-1 h-4">
            {item.description}
          </p>

          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-border/40">
            <div>
              <span className="text-sm sm:text-lg font-black text-primary">₹{item.price}</span>
              {item.customizable && (
                <span className="block text-[9px] text-muted-foreground font-medium leading-none">
                  Customizable
                </span>
              )}
            </div>

            {item.isAvailable && (
              quantity === 0 ? (
                <button
                  onClick={handleAddClick}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  Add
                </button>
              ) : (
                <div className="flex items-center gap-1 bg-muted rounded-xl p-0.5 sm:p-1 border border-border/60">
                  <button
                    onClick={handleDecrease}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 sm:w-7 text-center font-extrabold text-xs sm:text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
                    title={item.customizable ? 'Customize another item' : 'Add one more'}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Customization Dialog */}
      <ItemCustomizationModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCustomizationConfirm}
      />
    </>
  );
}
