import React, { useState } from 'react';
import { X, Plus, Sparkles, Check, Flame, MessageSquare } from 'lucide-react';
import { MenuItem, CustomizationOption } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ItemCustomizationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customizations: CustomizationOption, customizedPrice: number) => void;
}

const AVAILABLE_ADDONS = [
  { id: 'cheese', name: 'Extra Melted Cheese', price: 20 },
  { id: 'fries', name: 'Side of Crispy Fries', price: 35 },
  { id: 'dip', name: 'Chef Special Mayo Dip', price: 15 },
  { id: 'patty', name: 'Double Patty / Extra Portion', price: 30 },
];

const QUICK_INSTRUCTIONS = ['Crispy', 'Less Oil', 'No Onion', 'Extra Napkins'];

export default function ItemCustomizationModal({
  item,
  isOpen,
  onClose,
  onConfirm,
}: ItemCustomizationModalProps) {
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Extra Spicy'>('Medium');
  const [selectedAddons, setSelectedAddons] = useState<{ id: string; name: string; price: number }[]>([]);
  const [customNote, setCustomNote] = useState('');

  if (!item) return null;

  const toggleAddon = (addon: typeof AVAILABLE_ADDONS[0]) => {
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons(prev => [...prev, addon]);
    }
  };

  const handleQuickNote = (note: string) => {
    if (customNote.includes(note)) {
      setCustomNote(prev => prev.replace(note, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim());
    } else {
      setCustomNote(prev => (prev ? `${prev}, ${note}` : note));
    }
  };

  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const finalPrice = item.price + addonTotal;

  const handleApply = () => {
    onConfirm(
      {
        spiceLevel,
        addons: selectedAddons,
        instructions: customNote.trim() || undefined,
      },
      finalPrice
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-border bg-card">
        {/* Header Image with Gradient */}
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center text-foreground hover:bg-background transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-4 right-4">
            <div className="inline-flex items-center gap-1 bg-amber-500/20 backdrop-blur-md px-2 py-0.5 rounded-full text-amber-500 dark:text-amber-400 text-[10px] font-bold border border-amber-500/30 mb-1">
              <Sparkles className="w-3 h-3" /> Gourmet Customization
            </div>
            <h2 className="text-xl font-extrabold text-foreground leading-tight drop-shadow-xs">{item.name}</h2>
            <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 1. Spice Preference */}
          <div>
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Spice Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Mild', 'Medium', 'Extra Spicy'] as const).map(level => {
                const isSelected = spiceLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSpiceLevel(level)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Gourmet Add-ons */}
          <div>
            <label className="text-xs font-bold text-foreground flex items-center justify-between mb-2">
              <span>Gourmet Add-ons</span>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </label>
            <div className="space-y-2">
              {AVAILABLE_ADDONS.map(addon => {
                const isSelected = selectedAddons.some(a => a.id === addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-foreground'
                        : 'bg-muted/40 hover:bg-muted/70 border-border text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'border-muted-foreground/30 bg-background'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-foreground">{addon.name}</span>
                    </div>
                    <span className="font-extrabold text-primary">+₹{addon.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Chef Notes / Instructions */}
          <div>
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              Kitchen Instructions
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_INSTRUCTIONS.map(q => {
                const active = customNote.includes(q);
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQuickNote(q)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                      active
                        ? 'bg-foreground text-background font-bold border-foreground'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted border-border'
                    }`}
                  >
                    {active ? `✓ ${q}` : `+ ${q}`}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="e.g. Crispier crust, less spicy sauce..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Modal Bottom Action */}
        <div className="p-3 sm:p-4 bg-muted/40 border-t border-border flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Total Item Price</p>
            <p className="text-base sm:text-lg font-black text-primary">₹{finalPrice}</p>
          </div>
          <Button
            onClick={handleApply}
            className="flex-1 max-w-[200px] h-10 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md active:scale-95 transition-all"
          >
            Add to Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
