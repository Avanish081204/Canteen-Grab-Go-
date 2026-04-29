import { Order } from './store';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const orderTypeLabels = {
  'dine-in': 'Dine In',
  'take-away': 'Take Away',
  'staff-delivery': 'Staff Delivery',
};

export function generateBillHTML(order: Order): string {
  const date = new Date(order.createdAt);
  const formattedDate = date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding: 12px 0;">
        <div style="font-weight: 600; color: #1a1a1a;">${item.name}</div>
        <div style="font-size: 11px; color: #666;">Unit Price: ₹${item.price}</div>
      </td>
      <td style="padding: 12px 0; text-align: center; color: #1a1a1a;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1a1a1a;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const deliveryInfo = order.type === 'staff-delivery' ? `
    <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #f3f4f6;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 8px;">Delivery Information</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
        <div><span style="color: #6b7280;">Dept:</span> <span style="font-weight: 500;">${order.department || '-'}</span></div>
        <div><span style="color: #6b7280;">Loc:</span> <span style="font-weight: 500;">${order.location || '-'}</span></div>
        <div style="grid-column: span 2;"><span style="color: #6b7280;">Slot:</span> <span style="font-weight: 500;">${order.timeSlot || '-'}</span></div>
      </div>
    </div>
  ` : '';

  return `
    <div id="pdf-bill-content" style="
      width: 480px;
      background: #ffffff;
      padding: 40px;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      color: #1f2937;
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
        background: linear-gradient(90deg, #f97316 0%, #fb923c 100%);
      "></div>
      
      <div style="
        position: absolute;
        top: 50px;
        right: 10px;
        transform: rotate(15deg);
        border: 3px solid #10b981;
        color: #10b981;
        padding: 4px 20px;
        font-size: 16px;
        font-weight: 800;
        text-transform: uppercase;
        border-radius: 6px;
        opacity: 0.15;
      ">PAID</div>

      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 24px; font-weight: 800; color: #f97316; letter-spacing: -0.02em; margin-bottom: 4px;">🍽️ Campus Canteen</div>
        <div style="font-size: 12px; color: #6b7280; font-weight: 500;">BAPH College Campus, Main Canteen</div>
      </div>
      
      <div style="
        background: #fff7ed;
        border: 1px solid #ffedd5;
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        margin-bottom: 24px;
      ">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9a3412; margin-bottom: 4px;">Order Token</div>
        <div style="font-size: 32px; font-weight: 800; color: #f97316;">${order.token}</div>
        <div style="font-size: 12px; color: #ea580c; font-weight: 600; margin-top: 4px;">
          ${order.type === 'dine-in' ? 'Dine In' : order.type === 'take-away' ? 'Take Away' : 'Delivery'}
        </div>
      </div>
      
      <div style="
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #f3f4f6;
        padding-bottom: 16px;
        margin-bottom: 24px;
      ">
        <div>
          <div style="font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase;">Date & Time</div>
          <div style="font-size: 12px; font-weight: 600; color: #1f2937;">${formattedDate}, ${formattedTime}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase;">Payment Method</div>
          <div style="font-size: 12px; font-weight: 600; color: #1f2937;">${order.paymentMethod === 'upi' ? 'UPI / Online' : 'Cash on Counter'}</div>
        </div>
      </div>
      
      ${order.customerName ? `
        <div style="margin-bottom: 24px;">
          <div style="font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase;">Customer</div>
          <div style="font-size: 13px; font-weight: 600; color: #1f2937;">${order.customerName}</div>
          ${order.customerPhone ? `<div style="font-size: 11px; color: #6b7280;">${order.customerPhone}</div>` : ''}
        </div>
      ` : ''}
      
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <th style="text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; padding-bottom: 12px;">Item</th>
            <th style="text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; padding-bottom: 12px;">Qty</th>
            <th style="text-align: right; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; padding-bottom: 12px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      
      <div style="margin-top: 24px; border-top: 2px solid #f3f4f6; padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
          <span style="color: #6b7280;">Subtotal</span>
          <span style="font-weight: 600;">₹${order.total}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
          <span style="color: #6b7280;">Taxes</span>
          <span style="font-weight: 600;">₹0.00</span>
        </div>
        <div style="
          display: flex; 
          justify-content: space-between; 
          margin-top: 12px; 
          padding-top: 12px; 
          border-top: 1px solid #f3f4f6;
          font-size: 18px; 
          font-weight: 800; 
          color: #f97316;
        ">
          <span>Total</span>
          <span>₹${order.total}</span>
        </div>
      </div>
      
      ${deliveryInfo}
      
      <div style="
        margin-top: 40px;
        text-align: center;
        border-top: 1px dashed #e5e7eb;
        padding-top: 24px;
      ">
        <div style="font-size: 14px; font-weight: 700; color: #1f2937; margin-bottom: 4px;">Thank you for your order!</div>
        <div style="font-size: 11px; color: #9ca3af;">Receipt ID: ${order.id.substring(0, 18).toUpperCase()}</div>
      </div>
    </div>
  `;
}

export async function downloadBill(order: Order) {
  const toastId = toast.loading('Generating PDF...');
  
  try {
    const htmlString = generateBillHTML(order);
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.innerHTML = htmlString;
    document.body.appendChild(container);

    const element = document.getElementById('pdf-bill-content');
    if (!element) throw new Error('Failed to find bill content');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [canvas.width * 0.132, canvas.height * 0.132] // Dynamic size based on content
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Bill_${order.token}.pdf`);
    
    document.body.removeChild(container);
    toast.success('Bill downloaded as PDF', { id: toastId });
  } catch (err) {
    console.error('PDF Generation Error:', err);
    toast.error('Failed to generate PDF', { id: toastId });
  }
}

export function printBill(order: Order) {
  const html = generateBillHTML(order);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt - ${order.token}</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; background: #f3f4f6; }
            #pdf-bill-content { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = () => {
              window.print();
              // window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

