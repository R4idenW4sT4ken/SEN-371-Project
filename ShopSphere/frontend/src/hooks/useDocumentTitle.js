import { useEffect } from "react";

/**
 * Sets the browser tab title per page. Without this every route shared the
 * same static title from index.html, so the browser tab / history / bookmarks
 * never reflected which page (or which product) the user was actually on -
 * this also matters for screen reader users, who rely on title changes to
 * confirm an SPA navigation actually happened.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ShopSphere` : "ShopSphere";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
