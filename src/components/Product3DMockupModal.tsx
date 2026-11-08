import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Clock,
  Layers,
  Info,
  ShoppingCart,
  Sun,
  Moon,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Box,
  Check,
  Heart,
  Share2,
  ChefHat,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { MenuItem, addToCart, CustomizationOption } from '@/lib/store';
import { toast } from 'sonner';
import ItemCustomizationModal from './ItemCustomizationModal';

interface Product3DMockupModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCartUpdate: () => void;
}

// Intelligent realistic culinary ingredients based on item
function getCulinaryHighlights(item: MenuItem): { name: string; tag: string; desc: string; icon: string }[] {
  const name = item.name.toLowerCase();
  const cat = item.category.toLowerCase();

  if (name.includes('nacho')) {
    return [
      { name: 'Crispy Tortilla Chips', tag: 'Stone Ground', desc: 'Golden corn nachos fried to crisp perfection', icon: '🌽' },
      { name: 'Molten Queso & Cheddar', tag: 'Double Melt', desc: 'Creamy warm cheese sauce loaded over chips', icon: '🧀' },
      { name: 'Fire-Roasted Salsa', tag: 'Zesty Tang', desc: 'Diced tomatoes, jalapeños, onions & cilantro', icon: '🍅' },
      { name: 'Cool Sour Cream Dip', tag: 'Smooth Dip', desc: 'Rich cultured sour cream to balance the spice', icon: '🥣' },
    ];
  }

  if (name.includes('burger')) {
    return [
      { name: 'Butter Brioche Bun', tag: 'Golden Toasted', desc: 'Soft bakery bun lightly toasted with salted butter', icon: '🍞' },
      { name: 'Crispy Patty', tag: 'Herb Crusted', desc: 'Specially seasoned patty cooked to golden brown', icon: '🍔' },
      { name: 'Melted Cheddar Slice', tag: 'Rich & Gooey', desc: 'Aged yellow cheddar melted over the hot patty', icon: '🧀' },
      { name: 'Fresh Lettuce & Tomato', tag: 'Farm Fresh', desc: 'Crisp hand-picked lettuce and juicy ripe tomatoes', icon: '🥬' },
      { name: 'Secret Canteen Mayo', tag: 'Signature Blend', desc: 'Chef secret spiced mayonnaise dressing', icon: '🥫' },
    ];
  }

  if (name.includes('samosa') || name.includes('kachori')) {
    return [
      { name: 'Flaky Golden Crust', tag: 'Hand Rolled', desc: 'Crispy ajwain pastry fried in pure groundnut oil', icon: '🥟' },
      { name: 'Spiced Potato Filling', tag: 'Authentic Desi', desc: 'Mashed potatoes with green peas and ginger tadka', icon: '🥔' },
      { name: 'Sweet Saunth Chutney', tag: 'Tangy Sweet', desc: 'Slow simmered jaggery and tamarind reduction', icon: '🍯' },
      { name: 'Spicy Green Mint Dip', tag: 'Fresh Herb', desc: 'Fresh mint, coriander and green chilli puree', icon: '🌿' },
    ];
  }

  if (name.includes('vada')) {
    return [
      { name: 'Fresh Mumbai Pav', tag: 'Soft Ladi', desc: 'Pillowy soft Mumbai style pav with butter', icon: '🍞' },
      { name: 'Golden Batata Vada', tag: 'Authentic Tadka', desc: 'Spiced potato ball fried in crisp chickpea batter', icon: '🥔' },
      { name: 'Dry Garlic Chutney', tag: 'Fiery Red', desc: 'Roasted garlic and dried red chilli crumb', icon: '🧄' },
      { name: 'Fried Salted Chilli', tag: 'Crisp Garnish', desc: 'Tempered green chilli with rock salt sprinkle', icon: '🌶️' },
    ];
  }

  if (name.includes('noodle') || cat.includes('chinese') || name.includes('rice')) {
    return [
      { name: 'Wok-Tossed Noodles', tag: 'Smoking Wok Hei', desc: 'Long wheat noodles tossed on high flame', icon: '🍜' },
      { name: 'Crunchy Bell Peppers', tag: 'Julienned', desc: 'Fresh capsicum, cabbage and spring onions', icon: '🫑' },
      { name: 'Dark Umami Glaze', tag: 'Rich Garlic Soy', desc: 'Brewed dark soy sauce with toasted garlic chilli', icon: '🥢' },
    ];
  }

  if (cat.includes('meals') || name.includes('thali') || name.includes('paneer')) {
    return [
      { name: 'Shahi Paneer Gravy', tag: 'Rich Butter Tadka', desc: 'Fresh cottage cheese in creamy tomato cashew gravy', icon: '🍲' },
      { name: 'Dal Tadka Katori', tag: 'Slow Simmered', desc: 'Yellow lentils tempered with cumin, garlic and ghee', icon: '🥣' },
      { name: 'Basmati Rice', tag: 'Long Grain', desc: 'Fragrant steamed rice with whole spices', icon: '🍚' },
      { name: 'Butter Tandoori Roti', tag: 'Fresh Baked', desc: 'Hot whole-wheat flatbread with butter glaze', icon: '🫓' },
    ];
  }

  if (cat.includes('cold') || name.includes('coffee') || name.includes('drink')) {
    return [
      { name: 'Fresh Brewed Coffee', tag: 'Arabica Blend', desc: 'Rich roasted coffee brew blended with whole milk', icon: '☕' },
      { name: 'Whipped Cream Swirl', tag: 'Frothy Sweet', desc: 'Airy whipped cream with cocoa dust', icon: '🍦' },
      { name: 'Chocolate Fudge Drizzle', tag: 'Decadent', desc: 'Warm molten chocolate swirl down the glass', icon: '🍫' },
    ];
  }

  return [
    { name: 'Fresh Daily Prep', tag: '100% Hygienic', desc: 'Cooked fresh on order at our campus counter', icon: '✨' },
    { name: 'Verified Quality', tag: 'FSSAI Standards', desc: 'Finest sourced ingredients and clean prep', icon: '🛡️' },
    { name: 'Biodegradable Serve', tag: 'Eco Friendly', desc: 'Served in compostable premium food packaging', icon: '📦' },
  ];
}

export default function Product3DMockupModal({
  item,
  isOpen,
  onClose,
  onCartUpdate,
}: Product3DMockupModalProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [lightingMode, setLightingMode] = useState<'warm' | 'studio' | 'night'>('warm');
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'ingredients' | 'nutrition'>('visual');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !item) return null;

  // Interactive 3D Perspective Tilt based on cursor position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -14;
    const tiltY = ((x - centerX) / centerX) * 14;

    setTilt({ x: tiltX, y: tiltY });
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  const handleAddToCart = () => {
    if (item.customizable) {
      setIsCustomizeOpen(true);
    } else {
      addToCart(item);
      onCartUpdate();
      toast.success(`${item.name} added to order!`, { duration: 2000 });
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

  const highlights = getCulinaryHighlights(item);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-4xl max-h-[94vh] bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-foreground">
          {/* ── Modal Header ────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/70 bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                <ChefHat className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">{item.name}</h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Gourmet Studio
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Interactive 3D Perspective Showcase • Real Culinary Photography
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Modal Body: 3D Stage on Left, Food Explorer on Right ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
            {/* 3D Realistic Showcase Stage (Cols 1-7) */}
            <div
              className={`lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] flex flex-col items-center justify-center p-6 select-none overflow-hidden transition-colors duration-500 ${
                lightingMode === 'warm'
                  ? 'bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-card'
                  : lightingMode === 'studio'
                  ? 'bg-gradient-to-b from-slate-200/50 via-slate-100/20 to-card dark:from-slate-850 dark:to-card'
                  : 'bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-card'
              }`}
            >
              {/* Dynamic Ambient Background Glow */}
              <div
                className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
                  lightingMode === 'warm'
                    ? 'bg-amber-400/25'
                    : lightingMode === 'studio'
                    ? 'bg-sky-400/20'
                    : 'bg-indigo-500/30'
                }`}
              />

              {/* Top Pill: Category & Interactive Hint */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <span className="bg-card/90 backdrop-blur-md border border-border/80 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-amber-500" />
                  <span>3D Tilt Physics</span>
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  (Move mouse to tilt in 3D)
                </span>
              </div>

              {/* Price Pill */}
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  ₹{item.price}
                </span>
              </div>

              {/* ── 3D Interactive Perspective Showcase Card ──────────── */}
              <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative cursor-pointer transition-transform duration-150 ease-out"
                style={{
                  perspective: '1200px',
                }}
              >
                <div
                  className="relative rounded-3xl overflow-hidden shadow-2xl transition-transform duration-150 ease-out border-2 border-white/40 dark:border-white/10"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isZoomed ? 1.15 : 1})`,
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.2)',
                  }}
                >
                  {/* High-Resolution Real Culinary Food Image */}
                  <div className="relative w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 bg-muted overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />

                    {/* Gradient Depth Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                    {/* Dynamic Light Reflection Sheen Glare */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                      }}
                    />

                    {/* Floating 3D Depth Layer Badges */}
                    <div
                      className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between"
                      style={{ transform: 'translateZ(30px)' }}
                    >
                      <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 text-white text-xs font-bold shadow-md">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span>{item.calories || 280} kcal</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 text-white text-xs font-bold shadow-md">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>~{item.prepTimeMinutes || 6} mins prep</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ambient Floor Shadow */}
                <div
                  className="w-64 sm:w-80 h-10 bg-black/35 rounded-full blur-xl mx-auto -mt-5 pointer-events-none transition-transform duration-150"
                  style={{
                    transform: `translateX(${tilt.y * 1.5}px) scaleY(${1 - Math.abs(tilt.x) * 0.02})`,
                  }}
                />
              </div>

              {/* ── 3D Stage Overlay Controls ───────────────────────── */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs z-10 gap-2">
                {/* Zoom Toggle */}
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md border transition-all cursor-pointer ${
                    isZoomed
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card/90 text-foreground border-border/80 hover:bg-card'
                  }`}
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>{isZoomed ? 'Zoom 1.15x' : 'Fit View'}</span>
                </button>

                {/* Lighting Mode Selector */}
                <div className="flex items-center gap-1 bg-card/90 backdrop-blur-md p-1 rounded-full border border-border/80 shadow-xs">
                  <button
                    onClick={() => setLightingMode('warm')}
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${
                      lightingMode === 'warm'
                        ? 'bg-amber-500 text-white shadow-xs'
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
                        ? 'bg-slate-700 text-white shadow-xs'
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
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Night Lounge"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Culinary Details & Ordering Panel (Cols 8-12) */}
            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-border/70 p-4 sm:p-5 flex flex-col justify-between bg-card">
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex items-center p-1 bg-muted/80 rounded-2xl border border-border/50 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('visual')}
                    className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'visual'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>Story</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ingredients')}
                    className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'ingredients'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Ingredients</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('nutrition')}
                    className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'nutrition'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Nutrition</span>
                  </button>
                </div>

                {/* Tab 1: Story & Overview */}
                {activeTab === 'visual' && (
                  <div className="space-y-3.5 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        Category • {item.category}
                      </span>
                      <p className="text-xs text-foreground/85 leading-relaxed mt-1">
                        {item.description || 'Cooked fresh on order at our campus counter using authentic culinary spices.'}
                      </p>
                    </div>

                    {/* Taste & Texture Profile */}
                    <div className="p-3 rounded-2xl bg-muted/50 border border-border/60 space-y-2">
                      <span className="text-[11px] font-black text-foreground block">
                        Chef Taste &amp; Texture Profile:
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                        <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                          🔥 Spicy &amp; Flavorful
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                          ✨ 100% Fresh Daily
                        </span>
                        <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg">
                          ⚡ Quick ~6m Prep
                        </span>
                      </div>
                    </div>

                    {/* Campus Quality Guarantee */}
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="text-[11px] text-emerald-900 dark:text-emerald-300">
                        <span className="font-bold">SLRTCE Quality Seal:</span> Made in hygienic stainless steel kitchen using certified ingredients. Served hot with token tracking.
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Ingredients Breakdown */}
                {activeTab === 'ingredients' && (
                  <div className="space-y-2 animate-fade-in max-h-[260px] overflow-y-auto pr-1">
                    <p className="text-[11px] font-bold text-muted-foreground">
                      Culinary Composition &amp; Fresh Elements:
                    </p>
                    {highlights.map((h, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3 hover:bg-muted/70 transition-colors"
                      >
                        <span className="text-xl flex-shrink-0">{h.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-foreground truncate">{h.name}</p>
                            <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                              {h.tag}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{h.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Nutrition */}
                {activeTab === 'nutrition' && (
                  <div className="space-y-3 animate-fade-in text-xs">
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                      <span className="text-muted-foreground">Energy / Calories</span>
                      <span className="font-bold font-mono">{item.calories || 280} kcal</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                      <span className="text-muted-foreground">Dietary Classification</span>
                      <span className="font-bold capitalize">{item.dietary || 'Veg'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                      <span className="text-muted-foreground">Customization Options</span>
                      <span className="font-bold">{item.customizable ? 'Available (Spice, Cheese, Dips)' : 'Standard Recipe'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Pickup Counter</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Ground Floor Canteen Counter</span>
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