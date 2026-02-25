import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
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
  createRazorpayOrder,
  openRazorpayCheckout,
  verifyRazorpayPayment,
} from '@/lib/razorpay';
import { toast } from 'sonner';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [orderType, setOrderTypeState] = useState<OrderType | null>(null);
  const [paymentMethod] = useState<'upi'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  useEffect(() => {
    const type = getOrderType();
    if (!type) {
      navigate('/');
      return;
    }
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
      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(
        total,
        `canteen_${Date.now()}`,
        { orderType: orderType! }
      );

      // Open Razorpay checkout
      openRazorpayCheckout(
        {
          keyId: razorpayOrder.keyId,
          orderId: razorpayOrder.orderId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Canteen',
          description: 'Food Order Payment',
          customerName: name,
          customerPhone: phone,
          theme: { color: '#f97316' },
        },
        async (result) => {
          try {
            // Verify payment
            const verification = await verifyRazorpayPayment(result);

            if (verification.verified) {
              // Create order after successful payment
              const order = createOrder({
                type: orderType!,
                items: cart,
                total,
                customerName: name || undefined,
                customerPhone: phone || undefined,
                department: orderType === 'staff-delivery' ? department : undefined,
                location: orderType === 'staff-delivery' ? location : undefined,
                timeSlot: orderType === 'staff-delivery' ? timeSlot : undefined,
              });

              toast.success('Payment successful! Order placed.');
              navigate(`/success/${order.token}`);
            } else {
              toast.error('Payment verification failed. Please contact support.');
              setIsSubmitting(false);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please try again.');
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
    
    if (!name || !phone) {
      toast.error('Please fill name and phone number');
      return;
    }

    if (orderType === 'staff-delivery') {
      if (!department || !location || !timeSlot) {
        toast.error('Please fill all delivery details');
        return;
      }
    }

    handleUpiPayment();
  };

  const orderTypeLabels = {
    'dine-in': 'Dine In',
    'take-away': 'Take Away',
    'staff-delivery': 'Staff Delivery',
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/cart')}
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
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">₹{total}</span>
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

          {/* Payment Method */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/5">
              <CreditCard className="w-6 h-6 text-primary" />
              <span className="font-medium text-primary">UPI (Razorpay)</span>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              You'll be redirected to Razorpay for secure payment
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-hero !py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order • ₹${total}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
