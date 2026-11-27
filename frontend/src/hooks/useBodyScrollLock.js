import { useEffect } from "react";

// Shared across all modals/drawers so stacked overlays don't unlock each other.
let lockCount = 0;
let previousOverflow = "";

export default function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
