import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/lib/store';

export interface InventoryItem extends MenuItem {
  stock_quantity: number;
  low_stock_threshold: number;
}

export interface InventoryLogEntry {
  id: string;
  menu_item_id: string;
  item_name?: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reason: 'order' | 'restock' | 'waste' | 'adjustment' | 'initial';
  performed_by?: string;
  notes?: string;
  created_at: string;
}

export interface WasteLogEntry {
  id: string;
  menu_item_id: string;
  item_name?: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'spoiled' | 'cancelled_order' | 'other';
  cost_loss?: number;
  reported_by?: string;
  notes?: string;
  created_at: string;
}

// Local cache key for offline / fallback
const INVENTORY_CACHE_KEY = 'canteen_inventory_stock_v1';

function getLocalStockMap(): Record<string, { stock: number; threshold: number }> {
  try {
    const raw = localStorage.getItem(INVENTORY_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalStock(itemId: string, stock: number, threshold: number = 10) {
  try {
    const map = getLocalStockMap();
    map[itemId] = { stock, threshold };
    localStorage.setItem(INVENTORY_CACHE_KEY, JSON.stringify(map));
  } catch {}
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Could not fetch menu items from Supabase, returning empty array:', error);
      return [];
    }

    const localMap = getLocalStockMap();

    return data.map((dbItem: any) => {
      const local = localMap[dbItem.id];
      const stock = dbItem.stock_quantity !== undefined && dbItem.stock_quantity !== null
        ? Number(dbItem.stock_quantity)
        : (local?.stock ?? 100);

      const threshold = dbItem.low_stock_threshold !== undefined && dbItem.low_stock_threshold !== null
        ? Number(dbItem.low_stock_threshold)
        : (local?.threshold ?? 10);

      const isAvailable = stock > 0 ? (dbItem.is_available ?? true) : false;

      return {
        id: dbItem.id,
        name: dbItem.name,
        price: Number(dbItem.price),
        category: dbItem.category,
        image: dbItem.image,
        description: dbItem.description,
        isCombo: dbItem.is_combo,
        isAvailable,
        dietary: dbItem.dietary,
        stock_quantity: stock,
        low_stock_threshold: threshold,
      };
    });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    return [];
  }
}

export async function updateStock(
  itemId: string,
  newQuantity: number,
  reason: 'order' | 'restock' | 'waste' | 'adjustment' | 'initial',
  notes?: string,
  performedBy?: string
): Promise<boolean> {
  try {
    const items = await fetchInventory();
    const target = items.find((i) => i.id === itemId);
    const prevQuantity = target ? target.stock_quantity : 100;
    const change = newQuantity - prevQuantity;
    const isAvail = newQuantity > 0;

    // 1. Update menu_items table
    const { error: updateError } = await supabase
      .from('menu_items' as any)
      .update({
        stock_quantity: newQuantity,
        is_available: isAvail,
      })
      .eq('id', itemId);

    if (updateError) {
      console.warn('Supabase stock update notice (column may be local-only):', updateError.message);
    }

    // Save in local fallback
    saveLocalStock(itemId, newQuantity, target?.low_stock_threshold ?? 10);

    // 2. Insert into inventory_log
    await supabase
      .from('inventory_log' as any)
      .insert({
        menu_item_id: itemId,
        item_name: target?.name ?? 'Unknown Item',
        quantity_change: change,
        previous_quantity: prevQuantity,
        new_quantity: newQuantity,
        reason,
        performed_by: performedBy || 'Staff',
        notes: notes || null,
      })
      .then(() => {})
      .catch((e) => console.warn('Inventory log insert notice:', e));

    window.dispatchEvent(new Event('inventoryUpdated'));
    window.dispatchEvent(new Event('menuUpdated'));
    return true;
  } catch (err) {
    console.error('Error in updateStock:', err);
    return false;
  }
}

export async function restockItem(
  itemId: string,
  addQuantity: number,
  notes?: string,
  performedBy?: string
): Promise<boolean> {
  const items = await fetchInventory();
  const target = items.find((i) => i.id === itemId);
  const current = target ? target.stock_quantity : 0;
  return updateStock(itemId, current + addQuantity, 'restock', notes, performedBy);
}

export async function recordWaste(
  itemId: string,
  wasteQuantity: number,
  reason: 'expired' | 'damaged' | 'spoiled' | 'cancelled_order' | 'other',
  notes?: string,
  reportedBy?: string
): Promise<boolean> {
  try {
    const items = await fetchInventory();
    const target = items.find((i) => i.id === itemId);
    const current = target ? target.stock_quantity : 0;
    const newQty = Math.max(0, current - wasteQuantity);
    const loss = target ? target.price * wasteQuantity : 0;

    // 1. Log to waste_log
    await supabase
      .from('waste_log' as any)
      .insert({
        menu_item_id: itemId,
        item_name: target?.name ?? 'Item',
        quantity: wasteQuantity,
        reason,
        cost_loss: loss,
        reported_by: reportedBy || 'Staff',
        notes: notes || null,
      })
      .then(() => {})
      .catch((e) => console.warn('Waste log insert notice:', e));

    // 2. Adjust stock
    return await updateStock(
      itemId,
      newQty,
      'waste',
      `Waste: ${reason}. ${notes || ''}`.trim(),
      reportedBy
    );
  } catch (err) {
    console.error('Error in recordWaste:', err);
    return false;
  }
}

export async function decrementStockForOrder(
  items: { id: string; quantity: number; name?: string }[]
): Promise<void> {
  try {
    for (const item of items) {
      const allItems = await fetchInventory();
      const target = allItems.find((i) => i.id === item.id);
      if (target) {
        const nextQty = Math.max(0, target.stock_quantity - item.quantity);
        await updateStock(
          item.id,
          nextQty,
          'order',
          `Order decrement (${item.quantity}x)`,
          'System'
        );
      }
    }
  } catch (err) {
    console.warn('Notice in decrementStockForOrder:', err);
  }
}

export async function fetchInventoryLogs(limit: number = 50): Promise<InventoryLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('inventory_log' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as InventoryLogEntry[];
  } catch {
    return [];
  }
}

export async function fetchWasteLogs(limit: number = 50): Promise<WasteLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('waste_log' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as WasteLogEntry[];
  } catch {
    return [];
  }
}

