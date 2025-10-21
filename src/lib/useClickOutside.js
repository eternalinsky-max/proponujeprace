// src/lib/useClickOutside.js
"use client";
import { useEffect } from "react";

export function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handle(e) {
      if (!ref?.current) return;
      if (!ref.current.contains(e.target)) onOutside?.(e);
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [ref, onOutside]);
}
