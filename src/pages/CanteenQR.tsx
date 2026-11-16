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
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { CANTEEN_ORIGINAL_URL } from '@/lib/api-config';

export default function CanteenQR() {
  const navigate = useNavigate();
  const posterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('all');

  // Fixed Original Production Website URL (Always https://canteen-grab-go.vercel.app, never localhost!)
  const originUrl = CANTEEN_ORIGINAL_URL;

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
          : `canteen-grab-go-table-${selectedTable.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success('High-resolution QR Code image downloaded!');
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-36 sm:pb-20 text-foreground print:bg-white print:p-0 print:m-0">
      {/* ── Screen-only Sub-Header (Mobile-optimized, No Overlaps) ──── */}
      <div className="bg-card border-b border-border/70 py-2.5 px-3 sm:px-4 print:hidden sticky top-14 z-30 shadow-2xs">
        <div className="container mx-auto max-w-4xl flex items-center justify-between gap-2">
          {/* Back button + Title */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted text-foreground flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-extrabold text-foreground truncate flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Table &amp; Counter QR</span>
              </h1>
              <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                Print acrylic standees for canteen tables
              </p>
            </div>
          </div>

          {/* Quick Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer flex-shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Print Standee</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-6 print:p-0 print:max-w-none space-y-4 sm:space-y-6">
        {/* ── Responsive Controls Toolbar ────────────────────────────── */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3 print:hidden">
          {/* Dropdown Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground">
                Select Standee Location:
              </label>
              <p className="text-[11px] text-muted-foreground">
                Generate QR for counter or specific dining tables
              </p>
            </div>

            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 rounded-xl border border-input bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
            >
              <option value="all">General / Counter Standee</option>
              {Array.from({ length: 15 }, (_, i) => (
                <option key={i + 1} value={`Table ${i + 1}`}>
                  Table {i + 1} Standee
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons Grid (50/50 on phone, inline on desktop) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-2 border-t border-border/60">
            <button
              onClick={handleDownloadPNG}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer border border-border/70 active:scale-95 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Print A4 Poster</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all cursor-pointer border border-border/60 active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Website URL'}</span>
            </button>
          </div>
        </div>

        {/* ── Standee Poster Card (Mobile & Print Perfect) ───────────── */}
        <div
          ref={posterRef}
          className="mx-auto max-w-sm sm:max-w-md bg-white text-slate-900 border-2 sm:border-4 border-slate-900 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden print:border-2 print:shadow-none print:max-w-xl print:m-0 print:p-8"
        >
          {/* Top Banner Header */}
          <div className="text-center space-y-1 mb-4 sm:mb-6">
            <span className="inline-block bg-primary text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-xs">
              SLRTCE Campus Smart Food Court
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight pt-1">
              CANTEEN GRAB &amp; GO
            </h2>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-600 px-2">
              Skip the long counter line! Order fresh food directly from your phone.
            </p>

            {selectedTable !== 'all' && (
              <div className="pt-1.5">
                <span className="inline-block bg-slate-900 text-white font-mono font-black text-xs px-3 py-0.5 rounded-full">
                  📍 {selectedTable}
                </span>
              </div>
            )}
          </div>

          {/* Central QR Code Frame */}
          <div className="flex flex-col items-center justify-center p-4 sm:p-5 bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl sm:rounded-3xl border-2 border-dashed border-primary/40 my-3 shadow-inner">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
              <QRCodeSVG
                value={targetUrl}
                size={210}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: '/favicon.svg',
                  x: undefined,
                  y: undefined,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>

            <div className="mt-3 text-center w-full px-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-primary uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border border-primary/20 shadow-xs">
                <Smartphone className="w-3.5 h-3.5 flex-shrink-0" />
                Scan with Any Camera or Phone
              </span>
              <p className="text-[11px] font-mono text-slate-800 font-extrabold mt-1.5 break-all">
                {targetUrl}
              </p>
            </div>
          </div>

          {/* 3 Step Guide */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center my-4 pt-2 border-t border-slate-200">
            <div className="space-y-0.5">
              <div className="w-6 h-6 mx-auto rounded-full bg-slate-900 text-white text-[11px] font-black flex items-center justify-center">
                1
              </div>
              <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-800">Scan QR</p>
              <p className="text-[9px] text-slate-500 leading-tight">Live menu opens</p>
            </div>

            <div className="space-y-0.5">
              <div className="w-6 h-6 mx-auto rounded-full bg-slate-900 text-white text-[11px] font-black flex items-center justify-center">
                2
              </div>
              <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-800">Select Food</p>
              <p className="text-[9px] text-slate-500 leading-tight">Dine-in / Takeaway</p>
            </div>

            <div className="space-y-0.5">
              <div className="w-6 h-6 mx-auto rounded-full bg-slate-900 text-white text-[11px] font-black flex items-center justify-center">
                3
              </div>
              <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-800">Grab Token</p>
              <p className="text-[9px] text-slate-500 leading-tight">Live counter alert</p>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center pt-2.5 border-t border-slate-200 text-[10px] text-slate-600 space-y-1">
            <p className="font-bold flex items-center justify-center gap-1 text-emerald-700">
              <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span>100% Hygienic • Freshly Cooked • UPI &amp; Cash</span>
            </p>
            <p className="text-[9px] text-slate-500">
              Ground Floor Food Court, SLRTCE Campus
            </p>
          </div>
        </div>

        {/* Instructions Card (Screen only) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2 print:hidden">
          <h3 className="font-black text-xs sm:text-sm text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>How to use this Canteen Standee QR:</span>
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              Click <strong className="text-foreground">"Download PNG"</strong> to save this high-resolution QR and send it for acrylic table standee printing.
            </li>
            <li>
              Click <strong className="text-foreground">"Print A4 Poster"</strong> to directly print copies for dining tables and counter walls.
            </li>
            <li>
              Point any smartphone camera (iPhone, Android, WhatsApp QR, Google Lens, or Paytm/GPay) to instantly open the canteen menu.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
