import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Display from "./pages/Display";
import StaffCode from "./pages/StaffCode";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import AdminMenu from "./pages/AdminMenu";
import TrackOrder from "./pages/TrackOrder";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Reviews from "./pages/Reviews";
import Help from "./pages/Help";
import About from "./pages/About";
import Feedback from "./pages/Feedback";

const queryClient = new QueryClient();

// ── PWA Install Banner ────────────────────────────────────────────
function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  return (
    <div className="pwa-banner md:left-auto md:right-4 md:bottom-6 md:w-80">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-xl">🍽️</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground">Install App</p>
        <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all"
        >
          Install
        </button>
        <button
          onClick={() => setShow(false)}
          className="px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-all"
        >
          Later
        </button>
      </div>
    </div>
  );
}

// ── Animated Page Wrapper ─────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [key, setKey] = useState(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      setKey(location.pathname);
    }
  }, [location.pathname]);

  return (
    <div key={key} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success/:token" element={<Success />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/display" element={<Display />} />
        <Route path="/staff-code" element={<StaffCode />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors />
      <BrowserRouter>
        <Header />
        <AnimatedRoutes />
        <PWABanner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
