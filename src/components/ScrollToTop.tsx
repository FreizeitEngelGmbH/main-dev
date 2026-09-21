import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * wouter's useLocation() returns only the pathname (never the hash), so
 * this only fires on real route changes - not on same-page anchor jumps
 * like href="#anbieter", which the browser continues to handle natively.
 */
export function ScrollToTop() {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
