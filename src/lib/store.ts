import { supabase } from '@/integrations/supabase/client';
import { getApiUrl } from '@/lib/api-config';
import { decrementStockForOrder } from '@/lib/inventory';

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
  dietary?: 'veg' | 'non-veg' | 'jain';
  isSpecial?: boolean;
  isSpicy?: boolean;
  prepTimeMinutes?: number;
  calories?: number;
  customizable?: boolean;
}

export interface CustomizationOption {
  spiceLevel?: 'Mild' | 'Medium' | 'Extra Spicy';
  addons?: { id: string; name: string; price: number }[];
  instructions?: string;
}

export interface CartItem extends MenuItem {
  cartItemId?: string;
  quantity: number;
  customizations?: CustomizationOption;
  customizedPrice?: number;
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
  { id: '1', name: 'Samosa', price: 15, category: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', description: 'Crispy potato filled pastry with spices', isAvailable: true, dietary: 'veg', isSpecial: true, isSpicy: true, prepTimeMinutes: 4, calories: 180 },
  { id: '2', name: 'Vada Pav', price: 20, category: 'Snacks', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80', description: 'Mumbai style spicy potato burger in a bun', isAvailable: true, dietary: 'veg', isSpicy: true, prepTimeMinutes: 5, calories: 240, customizable: true },
  { id: '3', name: 'French Fries', price: 50, category: 'Snacks', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80', description: 'Crispy golden fries with classic seasoning', isAvailable: true, dietary: 'jain', prepTimeMinutes: 7, calories: 310, customizable: true },
  { id: '4', name: 'Pav Bhaji', price: 60, category: 'Snacks', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80', description: 'Spicy mashed vegetables served with buttered pav', isAvailable: true, dietary: 'veg', isSpecial: true, isSpicy: true, prepTimeMinutes: 8, calories: 420, customizable: true },
  
  // Sandwich & Burger
  { id: '5', name: 'Veg Burger', price: 45, category: 'Sandwich/Burger', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80', description: 'Classic vegetable patty burger with fresh lettuce', isAvailable: true, dietary: 'veg', prepTimeMinutes: 8, calories: 340, customizable: true },
  { id: '6', name: 'Cheese Burger', price: 60, category: 'Sandwich/Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', description: 'Loaded with melted cheese and fresh veggies', isAvailable: true, dietary: 'non-veg', prepTimeMinutes: 9, calories: 440, customizable: true },
  { id: '7', name: 'Grilled Sandwich', price: 40, category: 'Sandwich/Burger', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', description: 'Perfectly toasted sandwich with seasonal vegetables', isAvailable: true, dietary: 'jain', prepTimeMinutes: 7, calories: 290, customizable: true },
  { id: '8', name: 'Club Sandwich', price: 70, category: 'Sandwich/Burger', image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80', description: 'Triple layered premium sandwich with assorted fillings', isAvailable: true, dietary: 'non-veg', prepTimeMinutes: 10, calories: 510, customizable: true },
  
  // Chinese
  { id: '9', name: 'Veg Noodles', price: 60, category: 'Chinese', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80', description: 'Authentic stir-fried noodles with crisp vegetables', isAvailable: true, dietary: 'veg', isSpicy: true, prepTimeMinutes: 10, calories: 380, customizable: true },
  { id: '10', name: 'Manchurian', price: 70, category: 'Chinese', image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80', description: 'Crispy vegetable balls in a spicy, tangy sauce', isAvailable: true, dietary: 'veg', isSpicy: true, prepTimeMinutes: 10, calories: 360 },
  { id: '11', name: 'Fried Rice', price: 60, category: 'Chinese', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', description: 'Wok-tossed aromatic rice with sautéed vegetables', isAvailable: true, dietary: 'veg', prepTimeMinutes: 9, calories: 350 },
  { id: '12', name: 'Spring Roll', price: 40, category: 'Chinese', image: 'https://images.unsplash.com/photo-1548507200-1cd5cf07b722?auto=format&fit=crop&w=800&q=80', description: 'Crispy rolls with a delicious vegetable filling', isAvailable: true, dietary: 'veg', prepTimeMinutes: 8, calories: 260 },
  
  // Meals
  { id: '13', name: 'Thali', price: 80, category: 'Meals', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', description: 'Complete Indian meal with roti, rice, dal, and sabzi', isAvailable: true, dietary: 'veg', isSpecial: true, prepTimeMinutes: 6, calories: 650 },
  { id: '14', name: 'Rajma Chawal', price: 60, category: 'Meals', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', description: 'Slow-cooked kidney beans curry served with steamed rice', isAvailable: true, dietary: 'veg', prepTimeMinutes: 5, calories: 480 },
  { id: '15', name: 'Chole Bhature', price: 70, category: 'Meals', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80', description: 'Spicy chickpeas served with fluffy deep-fried bread', isAvailable: true, dietary: 'veg', isSpicy: true, prepTimeMinutes: 8, calories: 590 },
  
  // Cold Drinks
  { id: '16', name: 'Cold Coffee', price: 40, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80', description: 'Chilled creamy coffee served with a scoop of ice cream', isAvailable: true, dietary: 'jain', isSpecial: true, prepTimeMinutes: 4, calories: 220, customizable: true },
  { id: '17', name: 'Lemonade', price: 25, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80', description: 'Refreshing fresh lime soda with a hint of mint', isAvailable: true, dietary: 'jain', prepTimeMinutes: 3, calories: 95 },
  { id: '18', name: 'Mango Shake', price: 50, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=800&q=80', description: 'Thick and creamy mango milkshake made with real fruit', isAvailable: true, dietary: 'jain', prepTimeMinutes: 4, calories: 260 },
  { id: '19', name: 'Masala Chai', price: 15, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=800&q=80', description: 'Traditional hot Indian spiced tea with aromatic herbs', isAvailable: true, dietary: 'veg', isSpicy: true, prepTimeMinutes: 3, calories: 85 },
  
  // Combos
  { id: '20', name: 'Burger Combo', price: 99, category: 'Combos', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80', description: 'A satisfying meal of Burger, Fries, and a Cold Drink', isCombo: true, isAvailable: true, dietary: 'non-veg', isSpecial: true, prepTimeMinutes: 10, calories: 680, customizable: true },
  { id: '21', name: 'Vada Pav Combo', price: 40, category: 'Combos', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80', description: 'Classic Bombay Vada Pav served with hot Masala Chai', isCombo: true, isAvailable: true, dietary: 'veg', isSpicy: true, prepTimeMinutes: 6, calories: 340 },
  { id: '22', name: 'Chinese Combo', price: 120, category: 'Combos', image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80', description: 'Delicious Noodles with Manchurian and a Cold Drink', isCombo: true, isAvailable: true, dietary: 'veg', isSpecial: true, isSpicy: true, prepTimeMinutes: 12, calories: 620 },
  { id: '23', name: 'Pav Bhaji & Shake Combo', price: 85, category: 'Combos', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80', description: 'Butter Pav Bhaji with 2 extra butter pav and a chilled Cold Coffee Shake', isCombo: true, isAvailable: true, dietary: 'veg', isSpecial: true, prepTimeMinutes: 8, calories: 590, customizable: true },
  { id: '24', name: 'South Indian Feast Combo', price: 75, category: 'Combos', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', description: 'Crispy Masala Dosa, golden Medu Vada, coconut chutney, sambar and hot Filter Coffee', isCombo: true, isAvailable: true, dietary: 'veg', isSpecial: true, prepTimeMinutes: 7, calories: 460 },
  { id: '25', name: 'Deluxe Thali Meal Combo', price: 130, category: 'Combos', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', description: 'Royal Shahi Paneer, Dal Tadka, 3 Butter Rotis, fragrant Jeera Rice, salad and Gulab Jamun', isCombo: true, isAvailable: true, dietary: 'veg', isSpecial: true, prepTimeMinutes: 9, calories: 720 },
  { id: '26', name: 'Snack Attack Trio Combo', price: 50, category: 'Combos', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', description: '2 Crispy Golden Samosas, authentic Bombay Vada Pav and a hot Cutting Masala Chai', isCombo: true, isAvailable: true, dietary: 'veg', isSpicy: true, prepTimeMinutes: 5, calories: 510 },
  { id: '27', name: 'Grilled Club & Fries Combo', price: 95, category: 'Combos', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', description: 'Triple-layered toasted Cheese Club Sandwich with salted French Fries and Lemonade', isCombo: true, isAvailable: true, dietary: 'jain', isSpecial: true, prepTimeMinutes: 9, calories: 640, customizable: true },
  { id: '28', name: 'Mini Chinese Box Combo', price: 110, category: 'Combos', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', description: 'Wok tossed Veg Fried Rice served with 2 crispy Spring Rolls and a chilled beverage', isCombo: true, isAvailable: true, dietary: 'veg', isSpicy: true, prepTimeMinutes: 10, calories: 580, customizable: true },
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
  
  // Format: BAPHYYMMDD + sequential number + random string to avoid cross-device collisions
  const seq = counters.count;
  const seqStr = seq < 100 ? String(seq).padStart(2, '0') : String(seq);
  
  // Generate random 3-character string
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  const token = `BAPH${today}${seqStr}-${randomSuffix}`;
  
  // Increment for next order locally
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

export function addToCart(
  item: MenuItem,
  customizations?: CustomizationOption,
  customizedPrice?: number
) {
  const cart = getCart();
  const effectivePrice = customizedPrice ?? item.price;
  const customizationKey = customizations ? JSON.stringify(customizations) : '';
  const cartItemId = customizations ? `${item.id}_${Date.now().toString(36)}` : item.id;

  // Find exact matching item (same id and same customizations)
  const existingIndex = cart.findIndex(i => {
    if (customizations) {
      return i.id === item.id && JSON.stringify(i.customizations) === customizationKey;
    }
    return (i.cartItemId || i.id) === item.id && !i.customizations;
  });
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantity++;
  } else {
    cart.push({
      ...item,
      cartItemId,
      quantity: 1,
      customizations,
      customizedPrice: effectivePrice,
    });
  }
  
  saveCart(cart);
  return cart;
}

export function removeFromCart(cartItemIdOrId: string) {
  const cart = getCart().filter(i => (i.cartItemId || i.id) !== cartItemIdOrId);
  saveCart(cart);
  return cart;
}

export function updateCartQuantity(cartItemIdOrId: string, quantity: number) {
  const cart = getCart();
  const index = cart.findIndex(i => (i.cartItemId || i.id) === cartItemIdOrId);
  
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
  return getCart().reduce((sum, item) => sum + (item.customizedPrice ?? item.price) * item.quantity, 0);
}

// Order type functions
export function getOrderType(): OrderType {
  const stored = localStorage.getItem(ORDER_TYPE_KEY) as OrderType | null;
  if (!stored) {
    localStorage.setItem(ORDER_TYPE_KEY, 'dine-in');
    return 'dine-in';
  }
  return stored;
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

  // Decrement inventory stock for ordered items
  try {
    decrementStockForOrder(orderData.items);
  } catch (err) {
    console.warn('Stock decrement notice:', err);
  }

  // 1. Register push token with this order for background push notifications
  try {
    const fcmToken = localStorage.getItem('canteen_fcm_token');
    if (fcmToken) {
      fetch(getApiUrl('/api/register-token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: fcmToken,
          orderId,
          orderToken: token,
          userId,
        }),
      }).catch((e) => console.warn('Order push token register notice:', e));
    }
  } catch {}

  // 2. Trigger FCM Push Notification for NEW ORDER (even when app is OFF / closed)
  try {
    const itemsList = orderData.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
    const itemsSummary = itemsList.length > 55 ? itemsList.slice(0, 52) + '...' : itemsList;

    // A. Notify Staff & Admin devices
    fetch(getApiUrl('/api/send-push'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetRole: 'staff',
        type: 'new_order',
        orderId,
        orderToken: token,
        title: `New Order #${token} Received`,
        body: `₹${orderData.total} • ${(orderData.type || 'order').toUpperCase()} • ${itemsSummary}`,
      }),
    }).catch((err) => console.warn('New order staff push notification notice:', err));

    // B. Send confirmation push to Customer device if FCM token available
    const customerFcmToken = localStorage.getItem('canteen_fcm_token');
    if (customerFcmToken) {
      fetch(getApiUrl('/api/send-push'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: customerFcmToken,
          orderId,
          orderToken: token,
          type: 'order_placed',
          title: `Order #${token} Confirmed`,
          body: `Total ₹${orderData.total}. Kitchen is preparing your order.`,
        }),
      }).catch((err) => console.warn('Customer order confirmation push notice:', err));
    }
  } catch (err) {
    console.warn('FCM new order trigger notice:', err);
  }
  
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
    return null;
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
    paymentMethod: data.payment_method as 'upi' | 'cash',
    paymentStatus: data.payment_status as 'pending' | 'paid',
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
  if (!session?.user) return [];

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
    return [];
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
    return [];
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

  // 3. Trigger Server-side FCM Push Notification (works even when customer's app is closed/off)
  try {
    const targetOrder = orders.find(o => o.id === orderId);
    const orderToken = targetOrder?.token;
    
    let pushTitle = 'Order Update';
    let pushBody = `Order #${orderToken || ''} status has changed to ${status}.`;
    
    if (status === 'cooking') {
      pushTitle = 'Preparing Order';
      pushBody = `Order #${orderToken || ''} is currently being prepared in the kitchen.`;
    } else if (status === 'ready') {
      pushTitle = 'Order Ready for Pickup';
      pushBody = `Order #${orderToken || ''} is ready for collection at the counter!`;
    } else if (status === 'out-for-delivery') {
      pushTitle = 'Out for Delivery';
      pushBody = `Order #${orderToken || ''} is on its way for delivery.`;
    } else if (status === 'delivered') {
      pushTitle = 'Order Delivered';
      pushBody = `Order #${orderToken || ''} has been delivered successfully.`;
    }

    fetch(getApiUrl('/api/send-push'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        orderToken,
        title: pushTitle,
        body: pushBody,
        type: status,
      }),
    }).catch((err) => console.warn('FCM push notification trigger notice:', err));
  } catch (err) {
    console.warn('FCM push trigger notice:', err);
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
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const dbItems: MenuItem[] = data.map((dbItem: any) => ({
        id: dbItem.id,
        name: dbItem.name,
        price: Number(dbItem.price),
        category: dbItem.category,
        image: dbItem.image,
        description: dbItem.description,
        isCombo: dbItem.is_combo,
        isAvailable: dbItem.is_available,
        dietary: dbItem.dietary,
        isSpecial: dbItem.is_special,
        isSpicy: dbItem.is_spicy,
        prepTimeMinutes: dbItem.prep_time_minutes,
        calories: dbItem.calories,
        customizable: dbItem.customizable,
      }));

      // Merge built-in combos & local menu items that aren't yet in the database
      const dbNames = new Set(dbItems.map((i) => i.name.toLowerCase()));
      const missingLocalItems = menuItems.filter((i) => !dbNames.has(i.name.toLowerCase()));
      return [...dbItems, ...missingLocalItems];
    }
  } catch (err) {
    console.error('Error fetching menu items:', err);
  }

  // Fallback to local full menuItems
  return menuItems;
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

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  orderId: string;
  orderToken: string;
  customerName: string;
  rating: number;        // 1 – 5
  comment: string;
  items: any[];          // List of items ordered
  createdAt: string;
}

export async function submitReview(review: {
  orderId: string;
  orderToken: string;
  customerName: string;
  rating: number;
  comment: string;
  items: any[];
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('reviews')
    .insert([{
      order_id: review.orderId,
      order_token: review.orderToken,
      customer_name: review.customerName,
      rating: review.rating,
      comment: review.comment,
      items: review.items
    }]);

  if (error) {
    console.error('Error submitting review:', error.message, error.details, error.hint);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function fetchAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error.message);
    return [];
  }

  return (data ?? []).map((r: any) => ({
      id: r.id,
      orderId: r.order_id,
      orderToken: r.order_token,
      customerName: r.customer_name,
      rating: r.rating,
      comment: r.comment,
      items: r.items || [],
      createdAt: r.created_at
    })) as Review[];
}

export async function hasReviewForOrder(orderId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('order_id', orderId)
    .limit(1);

  if (error) return false;
  return (data?.length ?? 0) > 0;
}
