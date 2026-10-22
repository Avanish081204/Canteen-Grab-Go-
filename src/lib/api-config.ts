// Production API base URL for Vercel Serverless Functions
// Using full URL ensures Android native Capacitor app can reach the API endpoints (since relative URLs resolve to localhost on device)
export const API_BASE_URL = 'https://canteen-grab-go-main.vercel.app';

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
