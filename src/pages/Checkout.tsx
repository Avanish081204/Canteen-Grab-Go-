import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Loader2, Tag, CheckCircle2, X } from 'lucide-react';
import {
  getCart,
  getCartTotal,
  getOrderType,
  createOrder,
  departments,
  timeSlots,
  CartItem,
  OrderType,
} from '@/lib/store';
import {
  loadRazorpayScript,
  openRazorpayCheckout,
} from '@/lib/razorpay';
import { validateCoupon, applyCouponToOrder, Coupon } from '@/lib/coupons';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/use-notifications';

export default function Checkout() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [orderType, setOrderTypeState] = useState<OrderType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('upi');

  const finalTotal = Math.max(0, total - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setIsValidatingCoupon(true);
    try {
      const res = await validateCoupon(couponInput, total);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discount);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput('');
    toast.info('Coupon removed');
  };

  useEffect(() => {
    const type = getOrderType() || 'dine-in';
    setOrderTypeState(type);
    setCart(getCart());
    setTotal(getCartTotal());

    // Load Razorpay script
    loadRazorpayScript().then(setRazorpayLoaded);
  }, [navigate]);

  const handleUpiPayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment gateway is loading. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Open Razorpay checkout directly (client-side only, no server order needed)
      openRazorpayCheckout(
        {
          amount: finalTotal,
          currency: 'INR',
          name: 'Campus Canteen',
          description: 'Food Order Payment',
          customerName: name,
          customerPhone: phone,
          theme: { color: '#f97316' },
        },
        async (result) => {
          try {
            // Payment succeeded — create order with payment ID
            console.log('Payment successful, ID:', result.razorpay_payment_id);
            const order = await createOrder({
              type: orderType!,
              items: cart,
              total: finalTotal,
              customerName: name || undefined,
              customerPhone: phone || undefined,
              department: orderType === 'staff-delivery' ? department : undefined,
              location: orderType === 'staff-delivery' ? location : undefined,
              timeSlot: orderType === 'staff-delivery' ? timeSlot : undefined,
            }, 'upi', 'paid');

            // Record coupon usage
            if (appliedCoupon) {
              applyCouponToOrder(appliedCoupon.id, order.id, order.token, discountAmount);
            }

            toast.success('Payment successful! Order placed.');
            addNotification({
              type: 'order_placed',
              title: 'Order Placed 🎉',
              message: `Your order #${order.token} has been placed successfully!`,
              icon: '📦',
              orderId: order.id,
              orderToken: order.token,
            }, { skipToast: true });
            navigate(`/success/${order.token}`);
          } catch (error) {
            console.error('Order creation error after payment:', error);
            toast.error('Payment was successful but order creation failed. Please contact support.');
            setIsSubmitting(false);
          }
        },
        (error) => {
          console.error('Payment failed:', error);
          toast.error(error.description || 'Payment failed. Please try again.');
          setIsSubmitting(false);
        }
      );
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setIsSubmitting(false);
    }
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      toast.error('Please enter a valid name (at least 2 characters)');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      toast.error('Name should contain only letters and spaces');
      return;
    }

    const trimmedPhone = phone.trim();
    if (!/^\d{10}$/.test(trimmedPhone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (orderType === 'staff-delivery') {
      if (!department || !location || !timeSlot) {
        toast.error('Please fill all delivery details');
        return;
      }
    }

    if (paymentMethod === 'cash') {
      handleCashPayment();
    } else {
      handleUpiPayment();
    }
  };

  const handleCashPayment = async () => {
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        type: orderType!,
        items: cart,
        total: finalTotal,
        customerName: name || undefined,
        customerPhone: phone || undefined,
        department: orderType === 'staff-delivery' ? department : undefined,
        location: orderType === 'staff-delivery' ? location : undefined,
        timeSlot: orderType === 'staff-delivery' ? timeSlot : undefined,
      }, 'cash', 'pending');

      // Record coupon usage
      if (appliedCoupon) {
        applyCouponToOrder(appliedCoupon.id, order.id, order.token, discountAmount);
      }

      toast.success('Order placed successfully! Please pay at counter.');
      addNotification({
        type: 'order_placed',
        title: 'Order Placed (Pay at Counter) 💵',
        message: `Your order #${order.token} has been placed! Pay at counter when you collect.`,
        icon: '💵',
        orderId: order.id,
        orderToken: order.token,
      }, { skipToast: true });
      navigate(`/success/${order.token}`);
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Order creation failed. Please check your connection.');
      setIsSubmitting(false);
    }
  };

  const orderTypeLabels = {
    'dine-in': 'Dine In',
    'take-away': 'Take Away',
    'staff-delivery': 'Staff Delivery',
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/cart');
                }
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </button>
            <span className="text-sm font-medium bg-muted px-3 py-1 rounded-full">
              {orderType && orderTypeLabels[orderType]}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            {/* Promo Code Input */}
            <div className="pt-3 border-t border-border space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                Have a Promo Code?
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <div>
                      <span className="font-mono font-bold text-xs text-green-700 dark:text-green-400">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-[10px] text-green-600">
                        Saved ₹{discountAmount} on this order!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-muted-foreground hover:text-red-500 p-1"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. GRAB10, WELCOME50)"
                    className="flex-1 px-3 py-1.5 text-xs font-mono uppercase rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg disabled:opacity-50 hover:brightness-110 transition-all flex items-center gap-1"
                  >
                    {isValidatingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-xs font-semibold text-green-600">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-border/50">
                <span className="font-semibold text-base">Payable Amount</span>
                <span className="text-xl font-bold text-primary">₹{finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="font-semibold text-lg mb-4">
              {orderType === 'staff-delivery' ? 'Delivery Details' : 'Contact Details'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {orderType === 'staff-delivery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Room / Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Room 204, Lab 3"
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Time Slot</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className={`font-medium ${paymentMethod === 'upi' ? 'text-primary' : 'text-foreground'}`}>Pay Online (UPI)</p>
                    <p className="text-xs text-muted-foreground">Secure payment via Razorpay</p>
                  </div>
                </div>
                {paymentMethod === 'upi' && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 flex items-center justify-center font-bold text-lg ${paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'}`}>₹</div>
                  <div className="text-left">
                    <p className={`font-medium ${paymentMethod === 'cash' ? 'text-primary' : 'text-foreground'}`}>Pay at Counter</p>
                    <p className="text-xs text-muted-foreground">Pay when you collect your order</p>
                  </div>
                </div>
                {paymentMethod === 'cash' && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>

            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              {paymentMethod === 'upi' ? "You'll be redirected to Razorpay for secure payment" : "Order will be placed immediately"}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-hero !py-3 sm:!py-4 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order • ₹${finalTotal}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
