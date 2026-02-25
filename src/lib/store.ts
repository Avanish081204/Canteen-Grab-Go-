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
  createdAt: string;
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
  { id: '1', name: 'Samosa', price: 15, category: 'Snacks', image: samosaImg, description: 'Crispy potato filled pastry', isAvailable: true },
  { id: '2', name: 'Vada Pav', price: 20, category: 'Snacks', image: vadaPavImg, description: 'Mumbai style spicy potato burger', isAvailable: true },
  { id: '3', name: 'French Fries', price: 50, category: 'Snacks', image: friesImg, description: 'Crispy golden fries with seasoning', isAvailable: true },
  { id: '4', name: 'Pav Bhaji', price: 60, category: 'Snacks', image: vadaPavImg, description: 'Spicy mashed vegetables with buttered pav', isAvailable: true },
  
  // Sandwich & Burger
  { id: '5', name: 'Veg Burger', price: 45, category: 'Sandwich/Burger', image: burgerImg, description: 'Classic vegetable patty burger', isAvailable: true },
  { id: '6', name: 'Cheese Burger', price: 60, category: 'Sandwich/Burger', image: burgerImg, description: 'Loaded with cheese and veggies', isAvailable: true },
  { id: '7', name: 'Grilled Sandwich', price: 40, category: 'Sandwich/Burger', image: burgerImg, description: 'Toasted sandwich with vegetables', isAvailable: true },
  { id: '8', name: 'Club Sandwich', price: 70, category: 'Sandwich/Burger', image: burgerImg, description: 'Triple layered premium sandwich', isAvailable: true },
  
  // Chinese
  { id: '9', name: 'Veg Noodles', price: 60, category: 'Chinese', image: noodlesImg, description: 'Stir-fried noodles with vegetables', isAvailable: true },
  { id: '10', name: 'Manchurian', price: 70, category: 'Chinese', image: noodlesImg, description: 'Crispy veg balls in spicy sauce', isAvailable: true },
  { id: '11', name: 'Fried Rice', price: 60, category: 'Chinese', image: noodlesImg, description: 'Wok-tossed rice with vegetables', isAvailable: true },
  { id: '12', name: 'Spring Roll', price: 40, category: 'Chinese', image: samosaImg, description: 'Crispy rolls with veggie filling', isAvailable: true },
  
  // Meals
  { id: '13', name: 'Thali', price: 80, category: 'Meals', image: noodlesImg, description: 'Complete meal with roti, rice, dal, sabzi', isAvailable: true },
  { id: '14', name: 'Rajma Chawal', price: 60, category: 'Meals', image: noodlesImg, description: 'Kidney beans curry with rice', isAvailable: true },
  { id: '15', name: 'Chole Bhature', price: 70, category: 'Meals', image: vadaPavImg, description: 'Spicy chickpeas with fried bread', isAvailable: true },
  
  // Cold Drinks
  { id: '16', name: 'Cold Coffee', price: 40, category: 'Cold Drinks', image: coldCoffeeImg, description: 'Chilled coffee with ice cream', isAvailable: true },
  { id: '17', name: 'Lemonade', price: 25, category: 'Cold Drinks', image: coldCoffeeImg, description: 'Fresh lime soda', isAvailable: true },
  { id: '18', name: 'Mango Shake', price: 50, category: 'Cold Drinks', image: coldCoffeeImg, description: 'Thick mango milkshake', isAvailable: true },
  { id: '19', name: 'Masala Chai', price: 15, category: 'Cold Drinks', image: coldCoffeeImg, description: 'Hot Indian spiced tea', isAvailable: true },
  
  // Combos
  { id: '20', name: 'Burger Combo', price: 99, category: 'Combos', image: burgerImg, description: 'Burger + Fries + Cold Drink', isCombo: true, isAvailable: true },
  { id: '21', name: 'Vada Pav Combo', price: 40, category: 'Combos', image: vadaPavImg, description: 'Vada Pav + Masala Chai', isCombo: true, isAvailable: true },
  { id: '22', name: 'Chinese Combo', price: 120, category: 'Combos', image: noodlesImg, description: 'Noodles + Manchurian + Cold Drink', isCombo: true, isAvailable: true },
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
export function getOrders(): Order[] {
  const stored = localStorage.getItem(ORDERS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function createOrder(orderData: Omit<Order, 'id' | 'token' | 'status' | 'createdAt'>): Order {
  const orders = getOrders();
  const order: Order = {
    ...orderData,
    id: Date.now().toString(),
    token: generateToken(orderData.type),
    status: 'placed',
    createdAt: new Date().toISOString(),
  };
  
  orders.unshift(order);
  saveOrders(orders);
  clearCart();
  
  return order;
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index >= 0) {
    orders[index].status = status;
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
