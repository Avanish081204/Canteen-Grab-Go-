import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { getCart, getCartTotal, getOrderType, CartItem } from '@/lib/store';
import CartItemCard from '@/components/CartItemCard';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const orderType = getOrderType();

  useEffect(() => {
    if (!orderType) {
      navigate('/');
      return;
    }
    updateCart();
  }, [orderType, navigate]);

  const updateCart = () => {
    setCart(getCart());
    setTotal(getCartTotal());
  };

  const orderTypeLabels = {
    'dine-in': 'Dine In',
    'take-away': 'Take Away',
    'staff-delivery': 'Staff Delivery',
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some delicious items to get started!</p>
          <button
            onClick={() => navigate('/menu')}
            className="btn-hero"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/menu')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Menu
            </button>
            <span className="text-sm font-medium bg-muted px-3 py-1 rounded-full">
              {orderType && orderTypeLabels[orderType]}
            </span>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Your Cart</h1>
        <div className="space-y-3">
          {cart.map((item) => (
            <CartItemCard key={item.id} item={item} onUpdate={updateCart} />
          ))}
        </div>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="container mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-xl font-bold text-foreground">₹{total}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full btn-hero !py-4 text-lg"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
