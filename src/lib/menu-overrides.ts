import { MenuItem, categories as baseCategories, menuItems as baseMenuItems } from '@/lib/store';

const MENU_OVERRIDES_KEY = 'canteen_menu_overrides_v1';

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getMenuOverrides(): MenuItem[] | null {
  return safeParse<MenuItem[]>(localStorage.getItem(MENU_OVERRIDES_KEY));
}

export function getMenuItems(): MenuItem[] {
  return getMenuOverrides() ?? baseMenuItems;
}

export function setMenuOverrides(items: MenuItem[]) {
  localStorage.setItem(MENU_OVERRIDES_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('menuUpdated'));
}

export function clearMenuOverrides() {
  localStorage.removeItem(MENU_OVERRIDES_KEY);
  window.dispatchEvent(new Event('menuUpdated'));
}

export function upsertMenuItem(item: MenuItem) {
  const items = getMenuItems();
  const idx = items.findIndex((i) => i.id === item.id);
  const next = [...items];
  if (idx >= 0) next[idx] = item;
  else next.unshift(item);
  setMenuOverrides(next);
}

export function toggleItemAvailability(itemId: string) {
  const items = getMenuItems();
  const next = items.map((i) => (i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i));
  setMenuOverrides(next);
}

export function getMenuCategories(): string[] {
  const items = getMenuItems();
  const derived = Array.from(new Set(items.map((i) => i.category))).sort((a, b) => a.localeCompare(b));

  // Keep base order where possible, but ensure we include any new categories.
  const baseNoAll = baseCategories.filter((c) => c !== 'All');
  const inBaseOrder = baseNoAll.filter((c) => derived.includes(c));
  const extras = derived.filter((c) => !baseNoAll.includes(c));

  return ['All', ...inBaseOrder, ...extras];
}

export function generateMenuItemId(): string {
  // Stable enough for local-only admin edits.
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
