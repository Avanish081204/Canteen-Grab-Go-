// Production API base URL for Vercel Serverless Functions
// Using full URL ensures Android native Capacitor app can reach the API endpoints (since relative URLs resolve to localhost on device)
export const API_BASE_URL = 'https://canteen-grab-go-main.vercel.app';

// Original Primary Public Website URL
export const CANTEEN_ORIGINAL_URL = 'https://canteen-grab-go.vercel.app';

export function getPublicCanteenUrl(): string {
  if (typeof window === 'undefined') return CANTEEN_ORIGINAL_URL;
  const origin = window.location.origin;
  // If running locally, in emulator, or in Capacitor/Android native app, use original production URL
  if (
    !origin ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.includes('capacitor://') ||
    origin.includes('http://192.168.')
  ) {
    return CANTEEN_ORIGINAL_URL;
  }
  return origin;
}

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
