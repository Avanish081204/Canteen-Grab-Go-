import React, { useState, useEffect, useRef } from 'react';
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
  Plus,
  Minus,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Box,
  Eye,
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

// Intelligent realistic layer anatomy based on item name & category
function getDishAnatomy(item: MenuItem): { title: string; desc: string; icon: string }[] {
  const name = item.name.toLowerCase();
  const cat = item.category.toLowerCase();

  if (name.includes('burger')) {
    return [
      { title: 'Toasted Sesame Brioche', desc: 'Butter-toasted golden bun top', icon: '🍞' },
      { title: 'Crispy Gourmet Patty', desc: 'Herb-infused crispy golden filling', icon: '🍔' },
      { title: 'Melted Cheddar Cheese', desc: 'Rich gooey melted cheese slice', icon: '🧀' },
      { title: 'Garden Fresh Veggies', desc: 'Crunchy lettuce, sliced tomatoes & gherkins', icon: '🥬' },
      { title: 'Signature Canteen Sauce', desc: 'Creamy spicy secret house mayo', icon: '🥫' },
      { title: 'Seared Base Bun', desc: 'Lightly toasted bun base for extra crunch', icon: '🍞' },
    ];
  }

  if (name.includes('samosa') || name.includes('kachori')) {
    return [
      { title: 'Golden Flaky Crust', desc: 'Crispy ajwain-infused fried pastry', icon: '🥟' },
      { title: 'Spiced Potato Filling', desc: 'Crushed potatoes, green peas & fresh ginger', icon: '🥔' },
      { title: 'Secret Masala Blend', desc: 'Roasted cumin, coriander & garam masala', icon: '🌶️' },
      { title: 'Sweet Saunth Chutney', desc: 'Authentic jaggery & tamarind reduction', icon: '🍯' },
      { title: 'Zesty Mint Dip', desc: 'Fresh mint, coriander & green chilli chutney', icon: '🌿' },
    ];
  }

  if (name.includes('vada pav')) {
    return [
      { title: 'Soft Mumbai Pav', desc: 'Fresh bakery ladi pav with butter smear', icon: '🍞' },
      { title: 'Crispy Batata Vada', desc: 'Spiced potato ball fried in gram flour batter', icon: '🥔' },
      { title: 'Dry Garlic Chutney', desc: 'Fiery roasted garlic & coconut powder', icon: '🧄' },
      { title: 'Fried Green Chilli', desc: 'Lightly salted tempered green chilli', icon: '🌶️' },
    ];
  }

  if (name.includes('noodle') || cat.includes('chinese') || name.includes('rice')) {
    return [
      { title: 'Wok-Tossed Base', desc: 'Sizzling noodles tossed in smoking wok hei', icon: '🍜' },
      { title: 'Julienned Vegetables', desc: 'Crisp bell peppers, cabbage & spring onions', icon: '🫑' },
      { title: 'Dark Soy & Garlic Glaze', desc: 'Rich umami dark soy sauce & chilli oil', icon: '🥢' },
      { title: 'Scallion Garnish', desc: 'Fresh finely chopped spring onion greens', icon: '🧅' },
    ];
  }

  if (name.includes('combo')) {
    return [
      { title: 'Main Entrée Dish', desc: 'Signature gourmet burger or loaded meal', icon: '🍔' },
      { title: 'Golden Crisp Sides', desc: 'Salted potato fries or crispy spring rolls', icon: '🍟' },
      { title: 'Chilled Drink Pairing', desc: 'Ice-cold refreshing beverage or frappe', icon: '🥤' },
      { title: 'Signature Dips Duo', desc: 'Chef special garlic mayo & tangy salsa', icon: '🥣' },
    ];
  }

  if (cat.includes('meals') || name.includes('thali') || name.includes('paneer')) {
    return [
      { title: 'Signature Gravy Bowl', desc: 'Rich butter gravy slow-cooked with fresh cream', icon: '🍲' },
      { title: 'Tandoori Roti / Naan', desc: 'Freshly baked Indian flatbread with butter glaze', icon: '🫓' },
      { title: 'Fragrant Basmati Rice', desc: 'Long-grain cumin scented steamed rice', icon: '🍚' },
      { title: 'Lentil Dal & Salad', desc: 'Slow simmered dal tadka with crisp salad', icon: '🥗' },
    ];
  }

  // Default Beverage / Snack
  return [
    { title: 'Premium Ingredients', desc: 'Sourced fresh daily from verified campus vendors', icon: '✨' },
    { title: 'Fresh Preparation', desc: 'Made to order at our hygienic kitchen counter', icon: '🔥' },
    { title: 'Chef Presentation', desc: 'Served in eco-friendly biodegradable packaging', icon: '📦' },
  ];
}

export default function Product3DMockupModal({
  item,
  isOpen,
  onClose,
  onCartUpdate,
}: Product3DMockupModalProps) {
  const [rotationX, setRotationX] = useState(15);
  const [rotationY, setRotationY] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [lightingMode, setLightingMode] = useState<'warm' | 'studio' | 'night'>('warm');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTab, setActiveTab] = useState<'3d' | 'anatomy' | 'specs'>('3d');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // Auto-rotate animation loop
  useEffect(() => {
    if (!isOpen || !isAutoRotate) return;

    let currentY = rotationY;
    const animate = () => {
      currentY = (currentY + 0.45) % 360;
      setRotationY(currentY);
      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isOpen, isAutoRotate]);

  if (!isOpen || !item) return null;

  // Mouse & Touch Drag Handlers for 3D Turntable
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    setIsAutoRotate(false);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    setRotationY(prev => (prev + deltaX * 0.7) % 360);
    setRotationX(prev => Math.max(-25, Math.min(45, prev - deltaY * 0.5)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleResetView = () => {
    setRotationX(15);
    setRotationY(0);
    setZoomLevel(1);
    setIsAutoRotate(true);
  };

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
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded-full">
                    3D Mockup
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Interactive 360° Studio • Drag to rotate &amp; inspect layers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Reset view */}
              <button
                onClick={handleResetView}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                title="Reset 3D View"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Modal Body: 3D Stage on Left, Inspector on Right ───── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
            {/* 3D Stage (Cols 1-7) */}
            <div
              className={`lg:col-span-7 relative min-h-[340px] sm:min-h-[420px] flex flex-col items-center justify-center p-6 select-none overflow-hidden transition-colors duration-500 cursor-grab active:cursor-grabbing ${
                lightingMode === 'warm'
                  ? 'bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent'
                  : lightingMode === 'studio'
                  ? 'bg-gradient-to-b from-slate-200/50 via-slate-100/20 to-transparent dark:from-slate-800/40'
                  : 'bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-black/40'
              }`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Ambient Spotlight Glow */}
              <div
                className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
                  lightingMode === 'warm'
                    ? 'bg-amber-400/20'
                    : lightingMode === 'studio'
                    ? 'bg-blue-400/15'
                    : 'bg-indigo-500/25'
                }`}
              />

              {/* ── 3D Turntable Platter ────────────────────────────── */}
              <div
                className="relative transition-transform duration-75 ease-out"
                style={{
                  perspective: '1200px',
                  transform: `scale(${zoomLevel})`,
                }}
              >
                <div
                  className="relative transition-transform duration-75 ease-out"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
                  }}
                >
                  {/* Floating Platter Pedestal */}
                  <div
                    className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-2.5 transition-all shadow-2xl flex items-center justify-center"
                    style={{
                      transformStyle: 'preserve-3d',
                      background:
                        lightingMode === 'night'
                          ? 'radial-gradient(circle, #2d3748 0%, #1a202c 80%)'
                          : 'radial-gradient(circle, #ffffff 0%, #f1f5f9 85%, #e2e8f0 100%)',
                      boxShadow:
                        '0 25px 50px -12px rgba(0,0,0,0.45), 0 0 0 6px rgba(255,255,255,0.15) inset',
                    }}
                  >
                    {/* Outer Platter Edge Ring */}
                    <div className="absolute inset-1 rounded-full border border-black/10 dark:border-white/10 pointer-events-none" />

                    {/* Food Image Circle with 3D Pop Elevation */}
                    <div
                      className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-2xl relative"
                      style={{
                        transform: 'translateZ(30px)',
                        boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover pointer-events-none"
                      />

                      {/* Dynamic Reflection Glare */}
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(${rotationY + 45}deg, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                        }}
                      />
                    </div>

                    {/* Floating 3D Badge on Dish */}
                    <div
                      className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-white/30 flex items-center gap-1"
                      style={{
                        transform: 'translateZ(50px)',
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      ₹{item.price}
                    </div>
                  </div>

                  {/* 3D Ambient Platter Shadow on Floor */}
                  <div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/40 rounded-full blur-xl pointer-events-none"
                    style={{
                      transform: 'rotateX(90deg) translateZ(-40px)',
                    }}
                  />
                </div>
              </div>

              {/* ── 3D Stage Overlay Controls ───────────────────────── */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                {/* Auto-Rotate Switch */}
                <button
                  type="button"
                  onClick={() => setIsAutoRotate(!isAutoRotate)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md border transition-all ${
                    isAutoRotate
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card/80 text-foreground border-border/80 hover:bg-card'
                  }`}
                >
                  <RotateCw className={`w-3 h-3 ${isAutoRotate ? 'animate-spin' : ''}`} />
                  <span>{isAutoRotate ? '360° Rotating' : 'Rotate Paused'}</span>
                </button>

                {/* Lighting mode switcher */}
                <div className="flex items-center gap-1 bg-card/85 backdrop-blur-md p-1 rounded-full border border-border/80 shadow-xs">
                  <button
                    onClick={() => setLightingMode('warm')}
                    className={`p-1.5 rounded-full transition-all ${
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
                    className={`p-1.5 rounded-full transition-all ${
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
                    className={`p-1.5 rounded-full transition-all ${
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
                <div className="flex items-center gap-1 bg-card/85 backdrop-blur-md p-1 rounded-full border border-border/80 shadow-xs">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.15))}
                    className="p-1.5 rounded-full hover:bg-muted text-foreground transition-all"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold px-1">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.15))}
                    className="p-1.5 rounded-full hover:bg-muted text-foreground transition-all"
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
                    className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
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
                    className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'anatomy'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>3D Layers</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
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

                    {/* Dietary & Customization notice */}
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-[11px] text-amber-900 dark:text-amber-300">
                        <span className="font-bold">Freshly Prepared on Order:</span> All items are cooked hot at the counter. Customizable toppings &amp; spice levels available at checkout.
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: 3D Layers Breakdown */}
                {activeTab === 'anatomy' && (
                  <div className="space-y-2 animate-fade-in max-h-[260px] overflow-y-auto pr-1">
                    <p className="text-[11px] font-bold text-muted-foreground">
                      Layer-by-Layer Culinary Construction:
                    </p>
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
                        <span className="text-[10px] font-mono text-muted-foreground">L{idx + 1}</span>
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
                      className="px-3.5 py-2.5 rounded-2xl border border-border/80 hover:bg-muted text-xs font-bold text-foreground transition-all"
                    >
                      Customize
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all"
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
