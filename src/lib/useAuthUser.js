"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

/**
 * Відстежує поточного користувача Firebase + стан завантаження.
 * Автооновлює ID токен раз на ~50 хв для безпеки SSR/API-запитів.
 */
export function useAuthUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onIdTokenChanged((u) => {
      setUser(u ?? null);
      setLoading(false);
    });

    // оновлюємо токен (59 хвилин ≈ lifetime токена)
    const interval = setInterval(
      async () => {
        try {
          const u = auth.currentUser;
          if (u) await u.getIdToken(true);
        } catch (e) {
          console.warn("getIdToken refresh error", e);
        }
      },
      59 * 60 * 1000,
    );

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  return { user, loading };
}
