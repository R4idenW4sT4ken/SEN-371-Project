import { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";

/**
 * A reusable confirmation modal for destructive / hard-to-reverse actions
 * (e.g. cancelling an order). Deliberately used sparingly - not on low-stakes,
 * easily-reversible actions like removing a cart item, since confirming
 * everything trains users to click "confirm" without reading it.
 *
 * Accessible by design: traps focus while open, closes on Escape, restores
 * focus to the triggering element on close, and is announced correctly via
 * role="alertdialog" + aria-modal.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      confirmBtnRef.current?.focus();

      const handleKeyDown = (event) => {
        if (event.key === "Escape") {
          onCancel();
        }
        if (event.key === "Tab") {
          const focusable = dialogRef.current?.querySelectorAll(
            "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
          );
          if (!focusable || focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        triggerRef.current?.focus?.();
      };
    }
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <div
        className="dialog-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        ref={dialogRef}
      >
        <div className={`dialog-icon dialog-icon-${tone}`} aria-hidden="true">
          <TriangleAlert />
        </div>
        <h2 id="confirm-dialog-title" className="dialog-title">{title}</h2>
        {description && <p id="confirm-dialog-desc" className="dialog-desc">{description}</p>}
        <div className="dialog-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmBtnRef}
            className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
