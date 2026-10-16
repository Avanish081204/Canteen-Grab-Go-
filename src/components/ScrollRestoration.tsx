import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Cache for scroll positions
const scrollCache = new Map<string, number>();

export default function ScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType(); // 'POP' | 'PUSH' | 'REPLACE'
  const isRestoringRef = useRef(false);
  const cancelRestoreRef = useRef<(() => void) | null>(null);

  // Disable browser native scroll restoration so our manual restoration works smoothly
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Continuously record scroll position for the current location key and path
  useEffect(() => {
    const key = location.key || location.pathname;
    let rafId: number | null = null;

    const recordPosition = () => {
      // Don't record during restoration jumps to prevent intermediate 0 / clamped values
      if (isRestoringRef.current) return;

      const y = window.scrollY || document.documentElement.scrollTop || 0;
      scrollCache.set(key, y);
      scrollCache.set(location.pathname, y);
      try {
        sessionStorage.setItem(`scroll_${key}`, y.toString());
        sessionStorage.setItem(`scroll_p_${location.pathname}`, y.toString());
      } catch {
        // Ignore potential sessionStorage quota errors
      }
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(recordPosition);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      recordPosition();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.key, location.pathname]);

  // Handle page transitions: PUSH -> Scroll to top; POP -> Restore previous scroll position
  useEffect(() => {
    // Cancel any previous in-progress restoration retries
    if (cancelRestoreRef.current) {
      cancelRestoreRef.current();
      cancelRestoreRef.current = null;
    }

    const key = location.key || location.pathname;

    if (navType === 'POP') {
      // Back / Forward button pressed: Restore previous scroll position
      let savedY: number | undefined = scrollCache.get(key);
      if (savedY === undefined) {
        savedY = scrollCache.get(location.pathname);
      }
      if (savedY === undefined) {
        try {
          const stored = sessionStorage.getItem(`scroll_${key}`) || sessionStorage.getItem(`scroll_p_${location.pathname}`);
          if (stored) savedY = parseInt(stored, 10);
        } catch {
          // ignore
        }
      }

      const targetY = savedY && !isNaN(savedY) ? savedY : 0;

      if (targetY > 0) {
        isRestoringRef.current = true;
        window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });

        // Retries to handle dynamic / async page content loading (like menu items or images)
        let attempts = 0;
        let cancelled = false;

        const handleUserInterrupt = () => {
          cancelled = true;
          isRestoringRef.current = false;
          cleanup();
        };

        window.addEventListener('wheel', handleUserInterrupt, { passive: true, once: true });
        window.addEventListener('touchstart', handleUserInterrupt, { passive: true, once: true });
        window.addEventListener('keydown', handleUserInterrupt, { passive: true, once: true });

        const intervalId = setInterval(() => {
          attempts++;
          if (cancelled || attempts > 20) {
            isRestoringRef.current = false;
            cleanup();
            return;
          }

          // If document height is ready and scroll hasn't reached target yet
          if (Math.abs((window.scrollY || document.documentElement.scrollTop || 0) - targetY) > 5) {
            window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
          } else {
            // Target achieved
            isRestoringRef.current = false;
            cleanup();
          }
        }, 40);

        const cleanup = () => {
          clearInterval(intervalId);
          window.removeEventListener('wheel', handleUserInterrupt);
          window.removeEventListener('touchstart', handleUserInterrupt);
          window.removeEventListener('keydown', handleUserInterrupt);
        };

        cancelRestoreRef.current = cleanup;
      } else {
        isRestoringRef.current = false;
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    } else {
      // PUSH or REPLACE: Navigating to a new page -> Scroll to top
      isRestoringRef.current = false;

      if (location.hash) {
        const id = location.hash.replace('#', '');
        const elem = document.getElementById(id);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [location.key, location.pathname, navType, location.hash]);

  return null;
}
