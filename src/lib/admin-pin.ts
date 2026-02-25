const ADMIN_PIN_KEY = 'canteen_admin_pin';
const ADMIN_AUTH_KEY = 'canteen_admin_pin_authed';

type AdminAuthState = {
  authedAt: number;
};

export function hasAdminPin(): boolean {
  return Boolean(localStorage.getItem(ADMIN_PIN_KEY));
}

export function setAdminPin(pin: string) {
  localStorage.setItem(ADMIN_PIN_KEY, pin);
}

export function clearAdminPin() {
  localStorage.removeItem(ADMIN_PIN_KEY);
  localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function isAdminAuthed(maxAgeMs = 1000 * 60 * 60 * 8): boolean {
  const raw = localStorage.getItem(ADMIN_AUTH_KEY);
  if (!raw) return false;
  try {
    const state = JSON.parse(raw) as AdminAuthState;
    return Date.now() - state.authedAt <= maxAgeMs;
  } catch {
    return false;
  }
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function verifyAdminPin(pinAttempt: string): boolean {
  const stored = localStorage.getItem(ADMIN_PIN_KEY);
  if (!stored) return false;
  const ok = stored === pinAttempt;
  if (ok) {
    const state: AdminAuthState = { authedAt: Date.now() };
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(state));
  }
  return ok;
}
