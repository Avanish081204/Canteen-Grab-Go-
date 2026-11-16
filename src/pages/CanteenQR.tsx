import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Smartphone,
  UtensilsCrossed,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export default function CanteenQR() {
  const navigate = useNavigate();
  const posterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('all');

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://canteen-grab-go.vercel.app';
  
  const targetUrl = selectedTable === 'all'
    ? originUrl
    : `${originUrl}/?table=${encodeURIComponent(selectedTable)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    toast.success('Website link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = () => {
    const svgElement = posterRef.current?.querySelector('svg');
    if (!svgElement) {
      toast.error('Could not find QR Code SVG.');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Scale up for high resolution print quality
    const size = 1200;
    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 100, 100, size - 200, size - 200);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = selectedTable === 'all' 
          ? 'canteen-grab-go-qr.png' 
          : `canteen-grab-go-table-${selectedTable}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success('High-resolution QR Code image downloaded!');
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12 text-foreground print:bg-white print:p-0 print:m-0">
      {/* ── Screen-only Header ───────────────────────────────────────── */}
      <div className="bg-card border-b border-border/70 py-3 px-4 print:hidden">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-primary" />
              <span>Canteen Table &amp; Counter QR Standee</span>
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Standee</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-6 print:p-0 print:max-w-none">
        {/* Controls Toolbar (Screen only) */}
        <div className="mb-6 p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-foreground">
              Select Standee Type:
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">General / Counter Standee</option>
              {Array.from({ length: 15 }, (_, i) => (
                <option key={i + 1} value={`Table ${i + 1}`}>
                  Table {i + 1} Standee
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer border border-border/60"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Website URL'}</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer border border-border/60"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Download PNG Image</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Poster</span>
            </button>
          </div>
        </div>

        {/* ── Standee Poster Card (Print-optimized) ────────────────────── */}
        <div
          ref={posterRef}
          className="mx-auto max-w-md bg-white text-slate-900 border-4 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden print:border-2 print:shadow-none print:max-w-xl print:m-0 print:p-8"
        >
          {/* Top Banner Header */}
          <div className="text-center space-y-1 mb-6">
            <span className="inline-block bg-primary text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
              SLRTCE Campus Smart Food Court
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight pt-1">
              CANTEEN GRAB &amp; GO
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              Skip the long counter line! Order fresh food directly from your phone.
            </p>

            {selectedTable !== 'all' && (
              <div className="pt-2">
                <span className="inline-block bg-slate-900 text-white font-mono font-black text-xs px-3 py-0.5 rounded-full">
                  📍 {selectedTable}
                </span>
              </div>
            )}
          </div>

          {/* Central QR Code Frame */}
          <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl border-2 border-dashed border-primary/40 my-4 shadow-inner">
            <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200">
              <QRCodeSVG
                value={targetUrl}
                size={230}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: '/favicon.svg',
                  x: undefined,
                  y: undefined,
                  height: 38,
                  width: 38,
                  excavate: true,
                }}
              />
            </div>

            <div className="mt-3.5 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-primary/20 shadow-xs">
                <Smartphone className="w-3.5 h-3.5" />
                Scan with Any Camera or UPI App
              </span>
              <p className="text-[11px] font-mono text-slate-600 font-bold mt-1.5 break-all">
                {originUrl}
              </p>
            </div>
          </div>

          {/* 3 Step Guide */}
          <div className="grid grid-cols-3 gap-2 text-center my-5 pt-2 border-t border-slate-200">
            <div className="space-y-0.5">
              <div className="w-7 h-7 mx-auto rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                1
              </div>
              <p className="text-[11px] font-extrabold text-slate-800">Scan QR</p>
              <p className="text-[9px] text-slate-500">Opens live menu</p>
            </div>

            <div className="space-y-0.5">
              <div className="w-7 h-7 mx-auto rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                2
              </div>
              <p className="text-[11px] font-extrabold text-slate-800">Select Food</p>
              <p className="text-[9px] text-slate-500">Dine-in / Takeaway</p>
            </div>

            <div className="space-y-0.5">
              <div className="w-7 h-7 mx-auto rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                3
              </div>
              <p className="text-[11px] font-extrabold text-slate-800">Grab Token</p>
              <p className="text-[9px] text-slate-500">Live TV counter alert</p>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center pt-3 border-t border-slate-200 text-[10px] text-slate-600 space-y-1">
            <p className="font-bold flex items-center justify-center gap-1 text-emerald-700">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>100% Hygienic • Freshly Cooked • UPI &amp; Cash Accepted</span>
            </p>
            <p className="text-slate-500">
              Ground Floor Food Court, SLRTCE Campus • Mon – Sat: 8:00 AM – 6:30 PM
            </p>
          </div>
        </div>

        {/* Instructions Card (Screen only) */}
        <div className="mt-8 p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3 print:hidden">
          <h3 className="font-black text-sm text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>How to use this Canteen Standee QR:</span>
          </h3>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
            <li>
              Click <strong className="text-foreground">"Download PNG Image"</strong> to save this high-resolution QR and share it on WhatsApp or send it to your local college photocopy shop.
            </li>
            <li>
              Click <strong className="text-foreground">"Print A4 Poster"</strong> to directly print 5 to 10 copies for canteen tables, entry glass doors, and pickup counters.
            </li>
            <li>
              Any student with an <strong>iPhone Camera, Android Camera, Google Lens, WhatsApp QR, or Paytm/GPay scanner</strong> can point their camera at this QR to open the live canteen website in 1 second!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
