import React, { useState } from 'react';
import {
  X,
  RotateCw,
  Sun,
  Moon,
  Sparkles,
  Flame,
  Clock,
  Layers,
  Info,
  ShoppingCart,
  ZoomIn,
  ZoomOut,
  Box,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { MenuItem, addToCart, CustomizationOption } from '@/lib/store';
import { toast } from 'sonner';
import ItemCustomizationModal from './ItemCustomizationModal';
import RealFood3DViewer from './RealFood3DViewer';

interface Product3DMockupModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCartUpdate: () => void;
}

function getDishAnatomy(item: MenuItem): { title: string; desc: string; icon: string }[] {
  const name = item.name.toLowerCase();
  const cat = item.category.toLowerCase();

  if (name.includes('burger')) {
    return [
      { title: 'Toasted Sesame Brioche', desc: 'Butter-toasted golden bun top with sesame', icon: '🍞' },
      { title: 'Melted Cheddar Cheese', desc: 'Rich gooey melted cheese draped over patty', icon: '🧀' },
      { title: 'Crispy Gourmet Patty', desc: 'Herb-infused crispy golden filling', icon: '🍔' },
      { title: 'Garden Fresh Veggies', desc: 'Crunchy lettuce & ripe sliced tomatoes', icon: '🥬' },
      { title: 'Signature Canteen Sauce', desc: 'Creamy spicy secret house mayo', icon: '🥫' },
      { title: 'Seared Base Bun', desc: 'Lightly toasted bun base for crunch', icon: '🍞' },
    ];
  }

  if (name.includes('samosa') || name.includes('kachori')) {
    return [
      { title: 'Golden Flaky Crust', desc: 'Crispy ajwain-infused fried pastry', icon: '🥟' },
      { title: 'Spiced Potato Mash', desc: 'Crushed potatoes, green peas & ginger', icon: '🥔' },
      { title: 'Secret Masala Blend', desc: 'Roasted cumin, coriander & garam masala', icon: '🌶️' },
      { title: 'Sweet Saunth Chutney', desc: 'Authentic jaggery & tamarind reduction', icon: '🍯' },
      { title: 'Zesty Mint Dip', desc: 'Fresh mint & green chilli chutney', icon: '🌿' },
    ];
  }

  if (name.includes('vada')) {
    return [
      { title: 'Soft Mumbai Ladi Pav', desc: 'Bakery fresh pav with butter smear', icon: '🍞' },
      { title: 'Batata Vada Ball', desc: 'Spiced potato ball fried in gram flour', icon: '🥔' },
      { title: 'Fiery Garlic Chutney', desc: 'Roasted dry garlic & chilli dust', icon: '🧄' },
      { title: 'Tempered Green Chilli', desc: 'Lightly salted fried green chilli', icon: '🌶️' },
    ];
  }

  if (name.includes('noodle') || cat.includes('chinese') || name.includes('rice')) {
    return [
      { title: 'Wok-Tossed Hakka Noodles', desc: 'Sizzling noodles tossed in smoking wok hei', icon: '🍜' },
      { title: 'Julienned Capsicum & Carrots', desc: 'Crisp bell peppers & spring onion greens', icon: '🫑' },
      { title: 'Dark Soy & Chilli Glaze', desc: 'Rich umami dark soy sauce & chilli oil', icon: '🥢' },
      { title: 'Wooden Chopsticks Pair', desc: 'Traditional dining chopsticks', icon: '🥢' },
    ];
  }

  if (cat.includes('meals') || name.includes('thali') || name.includes('paneer')) {
    return [
      { title: 'Shahi Paneer Katori', desc: 'Rich butter gravy with tender paneer cubes', icon: '🍲' },
      { title: 'Slow-Simmered Dal Tadka', desc: 'Golden yellow lentils with garlic tempering', icon: '🥣' },
      { title: 'Fragrant Steamed Rice', desc: 'Steamed aromatic long-grain rice mound', icon: '🍚' },
      { title: 'Folded Butter Roti', desc: 'Fresh whole-wheat flatbread with butter glaze', icon: '🫓' },
    ];
  }

  if (cat.includes('cold') || name.includes('coffee') || name.includes('drink')) {
    return [
      { title: 'Whipped Cream Swirl', desc: 'Rich frothy sweet cream topping', icon: '🍦' },
      { title: 'Chilled Coffee Brew', desc: 'Fresh roasted coffee blend with whole milk', icon: '☕' },
      { title: 'Solid Ice Cubes', desc: 'Purified water crystal ice cubes', icon: '🧊' },
      { title: 'Signature Drinking Straw', desc: 'Retro red & white striped straw', icon: '🥤' },
    ];
  }

  return [
    { title: 'Gourmet Mini Burger', desc: 'Toasted bun with crispy patty & cheese', icon: '🍔' },
    { title: 'Golden French Fries Stack', desc: 'Crisp crinkle-cut salted potato fries', icon: '🍟' },
    { title: 'Chilled Beverage Cup', desc: 'Refreshing cold drink pairing', icon: '🥤' },
  ];
}

export default function Product3DMockupModal({
  item,
  isOpen,
  onClose,
  onCartUpdate,
}: Product3DMockupModalProps) {
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [lightingMode, setLightingMode] = useState<'warm' | 'studio' | 'night'>('warm');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isExploded, setIsExploded] = useState(false);
  const [activeTab, setActiveTab] = useState<'3d' | 'anatomy' | 'specs'>('3d');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  if (!isOpen || !item) return null;

  const handleAddToCart = () => {
    if (item.customizable) {
      setIsCustomizeOpen(true);
    } else {
      addToCart(item);
      onCartUpdate();
      toast.success(`${item.name} added to cart!`, { duration: 2000 });
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleCustomizationConfirm = (customizations: CustomizationOption, customPrice: number) => {
    addToCart(item, customizations, customPrice);
    onCartUpdate();
    toast.success(`${item.name} customized & added!`, { duration: 2000 });
    window.dispatchEvent(new Event('cartUpdated'));
    setIsCustomizeOpen(false);
  };

  const anatomy = getDishAnatomy(item);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-4xl max-h-[94vh] bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-foreground">
          {/* ── Modal Header ────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/70 bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                <Box className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">{item.name}</h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Real 3D WebGL Mesh
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Interactive 3D Studio • Drag to orbit 360° • Volumetric PBR geometry
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Modal Body: Real 3D Canvas on Left, Controls & Details on Right ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
            {/* Real 3D WebGL Canvas (Cols 1-7) */}
            <div
              className={`lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 ${
                lightingMode === 'warm'
                  ? 'bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-card'
                  : lightingMode === 'studio'
                  ? 'bg-gradient-to-b from-slate-200/50 via-slate-100/20 to-card dark:from-slate-800/40'
                  : 'bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-card'
              }`}
            >
              {/* Floating Live 3D Badge */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <span className="bg-card/90 backdrop-blur-md border border-border/80 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-amber-500" />
                  <span>360° Real 3D Model</span>
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  (Drag to rotate)
                </span>
              </div>

              {/* Price Pill */}
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  ₹{item.price}
                </span>
              </div>

              {/* REAL THREE.JS 3D CANVAS */}
              <RealFood3DViewer
                item={item}
                isAutoRotate={isAutoRotate}
                lightingMode={lightingMode}
                isExploded={isExploded}
                zoomLevel={zoomLevel}
              />

              {/* ── 3D Stage Overlay Controls ───────────────────────── */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs z-10 gap-2">
                {/* Auto-Rotate Switch */}
                <button
                  type="button"
                  onClick={() => setIsAutoRotate(!isAutoRotate)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md border transition-all cursor-pointer ${
                    isAutoRotate
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card/90 text-foreground border-border/80 hover:bg-card'
                  }`}
                >
                  <RotateCw className={`w-3 h-3 ${isAutoRotate ? 'animate-spin' : ''}`} />
                  <span>{isAutoRotate ? 'Auto Orbit' : 'Orbit Paused'}</span>
                </button>

                {/* Explode 3D Layers Button */}
                <button
                  type="button"
                  onClick={() => setIsExploded(!isExploded)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black backdrop-blur-md border transition-all cursor-pointer ${
                    isExploded
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                      : 'bg-card/90 text-foreground border-border/80 hover:border-amber-500/50'
                  }`}
                  title="Explode 3D Anatomy Layers"
                >
                  <Layers className="w-3 h-3" />
                  <span>{isExploded ? 'Collapse 3D' : 'Explode 3D'}</span>
                </button>

                {/* Lighting mode switcher */}
                <div className="flex items-center gap-1 bg-card/90 backdrop-blur-md p-1 rounded-full border border-border/80 shadow-xs">
                  <button
                    onClick={() => setLightingMode('warm')}
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${
                      lightingMode === 'warm'
                        ? 'bg-amber-500 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Warm Canteen Glow"
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setLightingMode('studio')}
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${
                      lightingMode === 'studio'
                        ? 'bg-slate-700 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Studio Spotlight"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setLightingMode('night')}
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${
                      lightingMode === 'night'
                        ? 'bg-indigo-600 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Night Lounge"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Zoom controls */}
                <div className="hidden sm:flex items-center gap-1 bg-card/90 backdrop-blur-md p-1 rounded-full border border-border/80 shadow-xs">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
                    className="p-1.5 rounded-full hover:bg-muted text-foreground transition-all cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold px-1">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.15))}
                    className="p-1.5 rounded-full hover:bg-muted text-foreground transition-all cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Inspector & Details Panel (Cols 8-12) */}
            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-border/70 p-4 sm:p-5 flex flex-col justify-between bg-card">
              <div className="space-y-4">
                {/* Mode Selector Tabs */}
                <div className="flex items-center p-1 bg-muted/80 rounded-2xl border border-border/50 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('3d')}
                    className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === '3d'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Overview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('anatomy')}
                    className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'anatomy'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>3D Anatomy</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'specs'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Nutrition</span>
                  </button>
                </div>

                {/* Tab 1: Overview */}
                {activeTab === '3d' && (
                  <div className="space-y-3.5 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        Category • {item.category}
                      </span>
                      <p className="text-xs text-foreground/80 leading-relaxed mt-1">
                        {item.description || 'Freshly prepared at campus counter using hygienic ingredients.'}
                      </p>
                    </div>

                    {/* Quick Highlights */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-2xl bg-muted/50 border border-border/60 text-center">
                        <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                        <span className="text-[10px] text-muted-foreground block">Calories</span>
                        <span className="text-xs font-black">{item.calories || 280} kcal</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-muted/50 border border-border/60 text-center">
                        <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                        <span className="text-[10px] text-muted-foreground block">Kitchen Prep</span>
                        <span className="text-xs font-black">~{item.prepTimeMinutes || 6} mins</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-muted/50 border border-border/60 text-center">
                        <Sparkles className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                        <span className="text-[10px] text-muted-foreground block">Quality</span>
                        <span className="text-xs font-black">100% Fresh</span>
                      </div>
                    </div>

                    {/* Interactive 3D Guide */}
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/25 flex items-start gap-2.5">
                      <Box className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-[11px] text-foreground">
                        <span className="font-bold">Interactive 3D Features:</span> Click and drag on the 3D model above to rotate the platter freely. Click <span className="font-bold text-amber-600 dark:text-amber-400">&ldquo;Explode 3D&rdquo;</span> to see the culinary layer breakdown!
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: 3D Layers Breakdown */}
                {activeTab === 'anatomy' && (
                  <div className="space-y-2 animate-fade-in max-h-[260px] overflow-y-auto pr-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-bold text-muted-foreground">
                        Culinary Construction:
                      </p>
                      <button
                        onClick={() => setIsExploded(!isExploded)}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        {isExploded ? 'Reset Layers' : 'Animate Explode'}
                      </button>
                    </div>
                    {anatomy.map((layer, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3 hover:bg-muted/70 transition-colors"
                      >
                        <span className="text-xl flex-shrink-0">{layer.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{layer.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{layer.desc}</p>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground font-bold">L{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Nutrition & Specs */}
                {activeTab === 'specs' && (
                  <div className="space-y-3 animate-fade-in text-xs">
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                      <span className="text-muted-foreground">Portion Size</span>
                      <span className="font-bold">Standard 1 Serving</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                      <span className="text-muted-foreground">Dietary Classification</span>
                      <span className="font-bold capitalize">{item.dietary || 'Veg'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                      <span className="text-muted-foreground">Estimated Energy</span>
                      <span className="font-bold font-mono">{item.calories || 280} kcal</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                      <span className="text-muted-foreground">Customizable Add-ons</span>
                      <span className="font-bold">{item.customizable ? 'Yes (Cheese, Spice, Dips)' : 'Standard Prep'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Campus Counter Pickup</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Ground Floor Canteen</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Add to Cart Action */}
              <div className="pt-4 border-t border-border/70 mt-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-bold">Total Price</span>
                  <span className="text-2xl font-black text-foreground">₹{item.price}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.customizable && (
                    <button
                      type="button"
                      onClick={() => setIsCustomizeOpen(true)}
                      className="px-3.5 py-2.5 rounded-2xl border border-border/80 hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer"
                    >
                      Customize
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item Customization Modal Integration */}
      {item.customizable && (
        <ItemCustomizationModal
          isOpen={isCustomizeOpen}
          item={item}
          onClose={() => setIsCustomizeOpen(false)}
          onConfirm={handleCustomizationConfirm}
        />
      )}
    </>
  );
}