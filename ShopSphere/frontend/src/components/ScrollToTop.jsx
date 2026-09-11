import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router (client-side navigation) does not reset scroll position the
 * way a real page load does - without this, navigating from the bottom of
 * a long product list to a new page leaves the user scrolled to the same
 * spot on the new page, which reads as broken. This resets to the top on
 * every route change, using an instant jump rather than the app's global
 * smooth-scroll (which is meant for in-page anchors, not page transitions).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
