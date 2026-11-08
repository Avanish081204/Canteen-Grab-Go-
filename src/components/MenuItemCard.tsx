import { Plus, Minus, Star, Flame, Clock, SlidersHorizontal, Box } from 'lucide-react';
import { MenuItem, addToCart, getCart, updateCartQuantity, CustomizationOption } from '@/lib/store';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ItemCustomizationModal from './ItemCustomizationModal';
import Product3DMockupModal from './Product3DMockupModal';

interface MenuItemCardProps {
  item: MenuItem;
  onCartUpdate: () => void;
}

export default function MenuItemCard({ item, onCartUpdate }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  useEffect(() => {
    const cart = getCart();
    const totalQty = cart
      .filter(i => i.id === item.id)
      .reduce((sum, i) => sum + i.quantity, 0);
    setQuantity(totalQty);
  }, [item.id]);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.customizable) {
      setIsModalOpen(true);
    } else {
      addToCart(item);
      setQuantity(prev => prev + 1);
      onCartUpdate();
      toast.success(`${item.name} added!`, { duration: 1800 });
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleCustomizationConfirm = (customizations: CustomizationOption, customizedPrice: number) => {
    addToCart(item, customizations, customizedPrice);
    setQuantity(prev => prev + 1);
    onCartUpdate();
    toast.success(`${item.name} (Customized) added!`, { duration: 1800 });
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newQty = quantity - 1;
    updateCartQuantity(item.id, newQty);
    setQuantity(Math.max(0, newQty));
    onCartUpdate();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <>
      <div
        className={`group relative rounded-3xl bg-card border border-border/70 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
          !item.isAvailable ? 'opacity-60 grayscale pointer-events-none' : ''
        }`}
      >
        {/* Top Image Section */}
        <div className="relative h-32 sm:h-40 md:h-48 w-full bg-muted overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            loading="lazy"
          />

          {/* Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Top-Left: Dietary Icon & Special Ribbon */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1.5">
              {/* Veg / Non-Veg / Jain Square Dot Indicator */}
              {item.dietary && (
                <div
                  className={`w-4 h-4 bg-white/95 backdrop-blur-md rounded-md border-2 ${
                    item.dietary === 'veg'
                      ? 'border-emerald-600'
                      : item.dietary === 'jain'
                      ? 'border-teal-500'
                      : 'border-rose-600'
                  } flex items-center justify-center shadow-md`}
                  title={item.dietary === 'jain' ? 'Jain Friendly' : item.dietary === 'veg' ? 'Pure Veg' : 'Non-Veg'}
                >
                  {item.dietary === 'jain' ? (
                    <span className="text-[8px] font-black text-teal-600 leading-none">J</span>
                  ) : (
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.dietary === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                  )}
                </div>
              )}

              {item.isSpecial && (
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-white" />
                  Bestseller
                </span>
              )}
            </div>

            {item.isCombo && (
              <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[9px] tracking-wider uppercase shadow-md">
                Combo
              </span>
            )}
          </div>

          {/* Top-Right: Prep Time & Spicy Tag */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
            {item.isSpicy && (
              <span className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] text-white shadow-sm flex items-center justify-center border border-white/20" title="Spicy Recipe">
                <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
              </span>
            )}
            <span className="bg-black/60 backdrop-blur-md text-white/90 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-sm">
              <Clock className="w-2.5 h-2.5 text-amber-400" />
              {item.prepTimeMinutes ? `${item.prepTimeMinutes}m` : '6m'}
            </span>
          </div>

          {/* Bottom-Left: Interactive 3D Mockup View Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIs3DModalOpen(true);
            }}
            className="absolute bottom-2 left-2.5 z-20 bg-black/75 hover:bg-black/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-lg border border-white/20 hover:border-amber-400/80 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer group/3d"
            title="Inspect Interactive 3D Mockup"
          >
            <Box className="w-3 h-3 text-amber-400 group-hover/3d:rotate-12 transition-transform" />
            <span className="tracking-wide">3D View</span>
          </button>

          {/* Swiggy/Zomato Signature Bottom Floating "ADD" Pill Button */}
          <div className="absolute bottom-2 right-2.5 z-20">
            {item.isAvailable && (
              quantity === 0 ? (
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="bg-card/95 hover:bg-card text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 hover:border-emerald-500 font-extrabold text-xs px-4 py-1.5 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center min-w-[76px]"
                >
                  <span className="flex items-center gap-1 tracking-wider uppercase text-[11px] leading-tight">
                    Add <Plus className="w-3 h-3 stroke-[3]" />
                  </span>
                  {item.customizable && (
                    <span className="text-[8px] text-muted-foreground font-semibold lowercase tracking-tight leading-none mt-0.5">
                      customise
                    </span>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-1 bg-card/95 text-foreground border border-emerald-500/50 rounded-xl px-1 py-0.5 shadow-lg">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-90 transition-all"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-black text-xs text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-90 transition-all"
                    title={item.customizable ? 'Customize another item' : 'Add one more'}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-xs sm:text-base text-foreground line-clamp-1 capitalize tracking-tight group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-muted-foreground text-[11px] sm:text-xs mt-0.5 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Price & Rating */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/40">
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-lg font-black text-foreground">
                ₹{item.price}
              </span>
              {item.calories && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  • {item.calories} cal
                </span>
              )}
            </div>

            <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>4.8</span>
            </div>
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

      {/* 3D Mockup Studio Modal */}
      <Product3DMockupModal
        item={item}
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        onCartUpdate={onCartUpdate}
      />
    </>
  );
}
