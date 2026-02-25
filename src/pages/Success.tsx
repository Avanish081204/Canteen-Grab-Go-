import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Home, Monitor, Download } from 'lucide-react';
import { getOrderByToken, Order, clearOrderType } from '@/lib/store';

const tokenClasses = {
  'dine-in': 'bg-sky-500',
  'take-away': 'bg-emerald-500',
  'staff-delivery': 'bg-purple-500',
};

const statusMessages = {
  'dine-in': 'Collect from counter when your token is called',
  'take-away': 'Your packed order will be ready at the counter',
  'staff-delivery': 'Your order will be delivered to your location',
};

const orderTypeLabels = {
  'dine-in': 'Dine In',
  'take-away': 'Take Away',
  'staff-delivery': 'Staff Delivery',
};

function generateInvoiceHTML(order: Order): string {
  const date = new Date(order.createdAt);
  const formattedDate = date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">₹${item.price}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const deliveryInfo = order.type === 'staff-delivery' ? `
    <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:8px;font-size:13px;">
      <strong>Delivery Details</strong><br/>
      Department: ${order.department || '-'}<br/>
      Location: ${order.location || '-'}<br/>
      Time Slot: ${order.timeSlot || '-'}
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head><title>Invoice - ${order.token}</title></head>
    <body style="font-family:'Segoe UI',Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;color:#1a1a1a;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="margin:0;font-size:22px;">🍽️ Campus Canteen</h1>
        <p style="margin:4px 0 0;color:#666;font-size:13px;">BAPH College Campus</p>
      </div>
      <hr style="border:none;border-top:2px dashed #ddd;margin:16px 0;"/>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:#555;">
        <div>
          <strong>Invoice</strong><br/>
          Token: <strong style="color:#000;">${order.token}</strong><br/>
          Type: ${orderTypeLabels[order.type]}
        </div>
        <div style="text-align:right;">
          ${formattedDate}<br/>
          ${formattedTime}
        </div>
      </div>
      ${order.customerName ? `<div style="margin-top:12px;font-size:13px;color:#555;">Customer: <strong>${order.customerName}</strong>${order.customerPhone ? ` | ${order.customerPhone}` : ''}</div>` : ''}
      <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:10px 12px;text-align:left;font-weight:600;">Item</th>
            <th style="padding:10px 12px;text-align:center;font-weight:600;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;">Price</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="text-align:right;margin-top:12px;font-size:18px;font-weight:700;">
        Total: ₹${order.total}
      </div>
      ${deliveryInfo}
      <hr style="border:none;border-top:2px dashed #ddd;margin:24px 0 12px;"/>
      <p style="text-align:center;color:#888;font-size:12px;margin:0;">
        Paid via UPI (Razorpay) • Thank you for your order!
      </p>
    </body>
    </html>
  `;
}

function downloadInvoice(order: Order) {
  const html = generateInvoiceHTML(order);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export default function Success() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (token) {
      const foundOrder = getOrderByToken(token);
      if (foundOrder) {
        setOrder(foundOrder);
        clearOrderType();
      } else {
        navigate('/');
      }
    }
  }, [token, navigate]);

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Success Animation */}
        <div className="mb-8 animate-bounce-in">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-14 h-14 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Placed!</h1>
          <p className="text-muted-foreground">Your order has been confirmed</p>
        </div>

        {/* Token Display */}
        <div className="bg-card rounded-3xl shadow-xl p-8 border border-border mb-6 animate-slide-up">
          <p className="text-sm text-muted-foreground mb-4">Your Token Number</p>
          <div className={`token-badge text-4xl md:text-5xl ${tokenClasses[order.type]} mb-6`}>
            {order.token}
          </div>
          <p className="text-muted-foreground">
            {statusMessages[order.type]}
          </p>

          {/* Order Details */}
          <div className="mt-8 pt-6 border-t border-border text-left">
            <h3 className="font-semibold mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">₹{order.total}</span>
            </div>
          </div>

          {order.type === 'staff-delivery' && (
            <div className="mt-4 pt-4 border-t border-border text-left text-sm space-y-1">
              <p><span className="text-muted-foreground">Delivery to:</span> {order.department}</p>
              <p><span className="text-muted-foreground">Location:</span> {order.location}</p>
              <p><span className="text-muted-foreground">Time:</span> {order.timeSlot}</p>
            </div>
          )}
        </div>

        {/* Download Invoice */}
        <button
          onClick={() => downloadInvoice(order)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:brightness-110 transition-all mb-4"
          style={{ boxShadow: 'var(--shadow-primary)' }}
        >
          <Download className="w-5 h-5" />
          Download Invoice
        </button>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground font-semibold py-4 rounded-xl hover:bg-muted/80 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/display')}
            className="flex-1 flex items-center justify-center gap-2 btn-hero !py-4"
          >
            <Monitor className="w-5 h-5" />
            View Display
          </button>
        </div>
      </div>
    </div>
  );
}
