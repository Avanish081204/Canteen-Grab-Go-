import { supabase } from '@/integrations/supabase/client';

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyResponse {
  verified: boolean;
  orderId?: string;
  paymentId?: string;
  error?: string;
}

// Create a Razorpay order
export async function createRazorpayOrder(
  amount: number,
  receipt?: string,
  notes?: Record<string, string>
): Promise<RazorpayOrderResponse> {
  const { data, error } = await supabase.functions.invoke('razorpay-order', {
    body: { amount, currency: 'INR', receipt, notes },
  });

  if (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(error.message || 'Failed to create payment order');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

// Verify payment after Razorpay checkout
export async function verifyRazorpayPayment(
  paymentResult: RazorpayPaymentResult
): Promise<RazorpayVerifyResponse> {
  const { data, error } = await supabase.functions.invoke('razorpay-verify', {
    body: paymentResult,
  });

  if (error) {
    console.error('Error verifying payment:', error);
    throw new Error(error.message || 'Failed to verify payment');
  }

  return data;
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

// Open Razorpay checkout
export function openRazorpayCheckout(
  options: {
    keyId: string;
    orderId: string;
    amount: number;
    currency?: string;
    name?: string;
    description?: string;
    customerName?: string;
    customerPhone?: string;
    theme?: { color: string };
  },
  onSuccess: (result: RazorpayPaymentResult) => void,
  onFailure: (error: any) => void
): void {
  const rzp = new (window as any).Razorpay({
    key: options.keyId,
    amount: options.amount,
    currency: options.currency || 'INR',
    name: options.name || 'Canteen',
    description: options.description || 'Food Order Payment',
    order_id: options.orderId,
    prefill: {
      name: options.customerName || '',
      contact: options.customerPhone || '',
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
