import { supabase } from '@/integrations/supabase/client';

// Types
export type OrderType = 'dine-in' | 'take-away' | 'staff-delivery';
export type OrderStatus = 'placed' | 'cooking' | 'ready' | 'collected' | 'out-for-delivery' | 'delivered';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isCombo?: boolean;
  isAvailable: boolean;
  dietary?: 'veg' | 'non-veg';
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  token: string;
  type: OrderType;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  department?: string;
  location?: string;
  timeSlot?: string;
  paymentMethod?: 'upi' | 'cash';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  createdAt: string;
  rating?: number;
}

// Food images
import samosaImg from '@/assets/food/samosa.jpg';
import vadaPavImg from '@/assets/food/vada-pav.jpg';
import burgerImg from '@/assets/food/burger.jpg';
import friesImg from '@/assets/food/fries.jpg';
import noodlesImg from '@/assets/food/noodles.jpg';
import coldCoffeeImg from '@/assets/food/cold-coffee.jpg';

// Menu data
export const menuItems: MenuItem[] = [
  // Snacks
  { id: '1', name: 'Samosa', price: 15, category: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', description: 'Crispy potato filled pastry with spices', isAvailable: true, dietary: 'veg' },
  { id: '2', name: 'Vada Pav', price: 20, category: 'Snacks', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80', description: 'Mumbai style spicy potato burger in a bun', isAvailable: true, dietary: 'veg' },
  { id: '3', name: 'French Fries', price: 50, category: 'Snacks', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80', description: 'Crispy golden fries with classic seasoning', isAvailable: true, dietary: 'veg' },
  { id: '4', name: 'Pav Bhaji', price: 60, category: 'Snacks', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80', description: 'Spicy mashed vegetables served with buttered pav', isAvailable: true, dietary: 'veg' },
  
  // Sandwich & Burger
  { id: '5', name: 'Veg Burger', price: 45, category: 'Sandwich/Burger', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80', description: 'Classic vegetable patty burger with fresh lettuce', isAvailable: true, dietary: 'veg' },
  { id: '6', name: 'Cheese Burger', price: 60, category: 'Sandwich/Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', description: 'Loaded with melted cheese and fresh veggies', isAvailable: true, dietary: 'non-veg' },
  { id: '7', name: 'Grilled Sandwich', price: 40, category: 'Sandwich/Burger', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', description: 'Perfectly toasted sandwich with seasonal vegetables', isAvailable: true, dietary: 'veg' },
  { id: '8', name: 'Club Sandwich', price: 70, category: 'Sandwich/Burger', image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80', description: 'Triple layered premium sandwich with assorted fillings', isAvailable: true, dietary: 'non-veg' },
  
  // Chinese
  { id: '9', name: 'Veg Noodles', price: 60, category: 'Chinese', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80', description: 'Authentic stir-fried noodles with crisp vegetables', isAvailable: true, dietary: 'veg' },
  { id: '10', name: 'Manchurian', price: 70, category: 'Chinese', image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80', description: 'Crispy vegetable balls in a spicy, tangy sauce', isAvailable: true, dietary: 'veg' },
  { id: '11', name: 'Fried Rice', price: 60, category: 'Chinese', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', description: 'Wok-tossed aromatic rice with sautéed vegetables', isAvailable: true, dietary: 'veg' },
  { id: '12', name: 'Spring Roll', price: 40, category: 'Chinese', image: 'https://images.unsplash.com/photo-1548507200-1cd5cf07b722?auto=format&fit=crop&w=800&q=80', description: 'Crispy rolls with a delicious vegetable filling', isAvailable: true, dietary: 'veg' },
  
  // Meals
  { id: '13', name: 'Thali', price: 80, category: 'Meals', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', description: 'Complete Indian meal with roti, rice, dal, and sabzi', isAvailable: true, dietary: 'veg' },
  { id: '14', name: 'Rajma Chawal', price: 60, category: 'Meals', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', description: 'Slow-cooked kidney beans curry served with steamed rice', isAvailable: true, dietary: 'veg' },
  { id: '15', name: 'Chole Bhature', price: 70, category: 'Meals', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80', description: 'Spicy chickpeas served with fluffy deep-fried bread', isAvailable: true, dietary: 'veg' },
  
  // Cold Drinks
  { id: '16', name: 'Cold Coffee', price: 40, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80', description: 'Chilled creamy coffee served with a scoop of ice cream', isAvailable: true, dietary: 'veg' },
  { id: '17', name: 'Lemonade', price: 25, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80', description: 'Refreshing fresh lime soda with a hint of mint', isAvailable: true, dietary: 'veg' },
  { id: '18', name: 'Mango Shake', price: 50, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=800&q=80', description: 'Thick and creamy mango milkshake made with real fruit', isAvailable: true, dietary: 'veg' },
  { id: '19', name: 'Masala Chai', price: 15, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=800&q=80', description: 'Traditional hot Indian spiced tea with aromatic herbs', isAvailable: true, dietary: 'veg' },
  
  // Combos
  { id: '20', name: 'Burger Combo', price: 99, category: 'Combos', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80', description: 'A satisfying meal of Burger, Fries, and a Cold Drink', isCombo: true, isAvailable: true, dietary: 'non-veg' },
  { id: '21', name: 'Vada Pav Combo', price: 40, category: 'Combos', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80', description: 'Classic Bombay Vada Pav served with hot Masala Chai', isCombo: true, isAvailable: true, dietary: 'veg' },
  { id: '22', name: 'Chinese Combo', price: 120, category: 'Combos', image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80', description: 'Delicious Noodles with Manchurian and a Cold Drink', isCombo: true, isAvailable: true, dietary: 'veg' },
];

export const categories = ['All', 'Snacks', 'Sandwich/Burger', 'Chinese', 'Meals', 'Cold Drinks', 'Combos'];

export const departments = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'IT',
  'MBA',
  'Library',
  'Admin Office',
  'Principal Office',
];

export const timeSlots = [
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM',
  '12:30 PM - 1:00 PM',
  '1:00 PM - 1:30 PM',
  '1:30 PM - 2:00 PM',
  '2:00 PM - 2:30 PM',
  '2:30 PM - 3:00 PM',
  '3:00 PM - 3:30 PM',
  '3:30 PM - 4:00 PM',
];

// Staff credentials
export const STAFF_CREDENTIALS = {
  id: 'canteen',
  password: '1234',
};

export const STAFF_DELIVERY_CODE = 'STAFF123';

// LocalStorage keys
const CART_KEY = 'canteen_cart';
const ORDERS_KEY = 'canteen_orders';
const ORDER_TYPE_KEY = 'canteen_order_type';
const TOKEN_COUNTERS_KEY = 'canteen_token_counters_v2';

// Token counters - resets daily
interface TokenCounters {
  date: string; // YYMMDD format
  count: number;
}

function getTodayDateString(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function getTokenCounters(): TokenCounters {
  const stored = localStorage.getItem(TOKEN_COUNTERS_KEY);
  const today = getTodayDateString();
  
  if (stored) {
    const parsed = JSON.parse(stored) as TokenCounters;
    // Reset counter if it's a new day
    if (parsed.date === today) {
      return parsed;
    }
  }
  
  // New day or no stored data - start fresh
  return { date: today, count: 1 };
}

function saveTokenCounters(counters: TokenCounters) {
  localStorage.setItem(TOKEN_COUNTERS_KEY, JSON.stringify(counters));
}

export function generateToken(_type: OrderType): string {
  const counters = getTokenCounters();
  const today = getTodayDateString();
  
  // Format: BAPHYYMMDD + sequential number (01, 02, ... 99, 100, 101...)
  const seq = counters.count;
  const seqStr = seq < 100 ? String(seq).padStart(2, '0') : String(seq);
  const token = `BAPH${today}${seqStr}`;
  
  // Increment for next order
  counters.date = today;
  counters.count = seq + 1;
  saveTokenCounters(counters);
  
  return token;
}

// Cart functions
export function getCart(): CartItem[] {
  const stored = localStorage.getItem(CART_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item: MenuItem) {
  const cart = getCart();
  const existingIndex = cart.findIndex(i => i.id === item.id);
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantity++;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  
  saveCart(cart);
  return cart;
}

export function removeFromCart(itemId: string) {
  const cart = getCart().filter(i => i.id !== itemId);
  saveCart(cart);
  return cart;
}

export function updateCartQuantity(itemId: string, quantity: number) {
  const cart = getCart();
  const index = cart.findIndex(i => i.id === itemId);
  
  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
  }
  
  saveCart(cart);
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Order type functions
export function getOrderType(): OrderType | null {
  return localStorage.getItem(ORDER_TYPE_KEY) as OrderType | null;
}

export function setOrderType(type: OrderType) {
  localStorage.setItem(ORDER_TYPE_KEY, type);
}

export function clearOrderType() {
  localStorage.removeItem(ORDER_TYPE_KEY);
}

// Order functions
// Order functions
export function getOrders(): Order[] {
  const stored = localStorage.getItem(ORDERS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export async function createOrder(orderData: Omit<Order, 'id' | 'token' | 'status' | 'createdAt'>, paymentMethod: 'upi' | 'cash', paymentStatus: 'pending' | 'paid' = 'pending'): Promise<Order> {
  const token = generateToken(orderData.type);
  const orderId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  
  let userId: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    userId = session?.user?.id ?? null;
  } catch (e) {
    console.warn('Could not get user, proceeding as guest:', e);
  }

  // 1. Insert order into Supabase
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      token,
      user_id: userId,
      status: 'placed',
      total: orderData.total,
      order_type: orderData.type,
      customer_name: orderData.customerName ?? null,
      customer_phone: orderData.customerPhone ?? null,
      department: orderData.department ?? null,
      location: orderData.location ?? null,
      time_slot: orderData.timeSlot ?? null,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
    });

  if (orderError) {
    console.error('Order insert error:', orderError);
    throw new Error('Failed to create order in database. Please check your connection.');
  }

  // 2. Insert order items
  const itemsToInsert = orderData.items.map(item => ({
    order_id: orderId,
    menu_item_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Order items insert error:', itemsError);
    // Ideally we would rollback the order here, but for now we'll just log
  }

  const order: Order = {
    ...orderData,
    id: orderId,
    token,
    status: 'placed',
    paymentMethod,
    paymentStatus,
    createdAt,
  };
  
  // Save to local for immediate feedback
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  
  clearCart();
  
  return order;
}

export async function fetchOrderByToken(token: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('token', token)
    .single();

  if (error || !data) {
    console.error('Error fetching order by token:', error);
    // Fallback to local if absolutely necessary or return null
    return getOrders().find(o => o.token === token) || null;
  }

  return {
    id: data.id,
    token: data.token,
    type: data.order_type as OrderType,
    total: data.total,
    status: data.status as OrderStatus,
    customerName: data.customer_name,
    customerPhone: data.customer_phone,
    department: data.department,
    location: data.location,
    timeSlot: data.time_slot,
    paymentMethod: data.payment_method,
    paymentStatus: data.payment_status,
    createdAt: data.created_at,
    items: data.order_items.map((item: any) => ({
      id: item.menu_item_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: '',
      image: '',
      description: '',
      isAvailable: true
    }))
  };
}

export async function fetchUserOrders(): Promise<Order[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return getOrders();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    return getOrders();
  }

  const mappedOrders: Order[] = data.map((row: any) => ({
    id: row.id,
    token: row.token,
    type: row.order_type as OrderType,
    total: row.total,
    status: row.status as OrderStatus,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    department: row.department,
    location: row.location,
    timeSlot: row.time_slot,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    items: row.order_items.map((item: any) => ({
      id: item.menu_item_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: '',
      image: '',
      description: '',
      isAvailable: true
    }))
  }));

  saveOrders(mappedOrders);
  return mappedOrders;
}

export async function fetchStaffOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching staff orders:', error);
    return getOrders();
  }

  const mappedOrders: Order[] = data.map((row: any) => ({
    id: row.id,
    token: row.token,
    type: row.order_type as OrderType,
    total: row.total,
    status: row.status as OrderStatus,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    department: row.department,
    location: row.location,
    timeSlot: row.time_slot,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    items: row.order_items.map((item: any) => ({
      id: item.menu_item_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: '',
      image: '',
      description: '',
      isAvailable: true
    }))
  }));

  saveOrders(mappedOrders);
  return mappedOrders;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  // 1. Update Supabase
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status in Supabase:', error);
    throw new Error('Failed to update order status in database.');
  }

  // 2. Update local state
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index >= 0) {
    orders[index].status = status;
    saveOrders(orders);
  }
  
  return orders;
}

export function rateOrder(orderId: string, rating: number) {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index >= 0) {
    orders[index].rating = rating;
    saveOrders(orders);
  }
  
  return orders;
}

export function getReadyOrders(): Order[] {
  return getOrders().filter(o => o.status === 'ready');
}

export function getOrderByToken(token: string): Order | undefined {
  return getOrders().find(o => o.token === token);
}

// Menu Supabase API functions
export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching menu items:', error);
    // Fallback to local items if offline
    return menuItems;
  }

  return data.map((dbItem: any) => ({
    id: dbItem.id,
    name: dbItem.name,
    price: Number(dbItem.price),
    category: dbItem.category,
    image: dbItem.image,
    description: dbItem.description,
    isCombo: dbItem.is_combo,
    isAvailable: dbItem.is_available,
    dietary: dbItem.dietary
  }));
}

export async function addMenuItem(item: Omit<MenuItem, "id">): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image,
      description: item.description,
      is_combo: item.isCombo || false,
      is_available: item.isAvailable,
      dietary: item.dietary || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding menu item:', error);
    return null;
  }
  return { ...item, id: data.id };
}

export async function updateMenuItem(id: string, item: Partial<MenuItem>): Promise<boolean> {
  const updateData: any = {};
  if (item.name !== undefined) updateData.name = item.name;
  if (item.price !== undefined) updateData.price = item.price;
  if (item.category !== undefined) updateData.category = item.category;
  if (item.image !== undefined) updateData.image = item.image;
  if (item.description !== undefined) updateData.description = item.description;
  if (item.isCombo !== undefined) updateData.is_combo = item.isCombo;
  if (item.isAvailable !== undefined) updateData.is_available = item.isAvailable;
  if (item.dietary !== undefined) updateData.dietary = item.dietary;

  const { error } = await supabase
    .from('menu_items')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating menu item:', error);
    return false;
  }
  return true;
}
