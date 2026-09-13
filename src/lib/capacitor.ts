// Safe Capacitor plugin loader with web fallback

export const isNativeMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  const cap = (window as any).Capacitor;
  return !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
};

export const getMobilePlatform = (): string => {
  if (typeof window === 'undefined') return 'web';
  const cap = (window as any).Capacitor;
  return cap?.getPlatform ? cap.getPlatform() : 'web';
};

export const initCapacitorPlugins = async () => {
  if (!isNativeMobile()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#e53e3e' });
  } catch (err) {
    // Graceful fallback if plugin not installed or in browser mode
  }

  try {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    });
  } catch (err) {
    // Graceful fallback
  }
};

export const triggerHaptic = async (style: string = 'LIGHT') => {
  if (!isNativeMobile()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const impactStyle = (ImpactStyle as any)[style] || ImpactStyle.Light;
    await Haptics.impact({ style: impactStyle });
  } catch (err) {
    // Fallback if haptics unavailable
  }
};
