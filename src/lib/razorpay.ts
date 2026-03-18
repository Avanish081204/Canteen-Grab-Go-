// Razorpay client-side integration (no Edge Functions needed)

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

// Load Razorpay checkout script
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Open Razorpay checkout directly (without server-side order creation)
export function openRazorpayCheckout(
  options: {
    amount: number;
    currency?: string;
    name?: string;
    description?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    theme?: { color: string };
  },
  onSuccess: (result: RazorpayPaymentResult) => void,
  onFailure: (error: any) => void
): void {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!keyId) {
    onFailure({ description: 'Razorpay Key ID not configured. Please add VITE_RAZORPAY_KEY_ID to your .env file.' });
    return;
  }

  const rzp = new (window as any).Razorpay({
    key: keyId,
    amount: Math.round(options.amount * 100), // Convert to paise
    currency: options.currency || 'INR',
    name: options.name || 'Campus Canteen',
    description: options.description || 'Food Order Payment',
    prefill: {
      name: options.customerName || '',
      contact: options.customerPhone || '',
      email: options.customerEmail || '',
    },
    theme: options.theme || { color: '#f97316' },
    handler: function (response: RazorpayPaymentResult) {
      onSuccess(response);
    },
  });

  rzp.on('payment.failed', function (response: any) {
    onFailure(response.error);
  });

  rzp.open();
}
