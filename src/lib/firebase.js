// src/lib/firebase.js
"use client";

import { auth, googleProvider } from "./firebase-client";
import {
  RecaptchaVerifier,
  signInWithPopup,
  signInWithRedirect,
  signInWithPhoneNumber,
} from "firebase/auth";

/** Google login з fallback на redirect (для Safari/WebView/COOP) */
export async function loginWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    // fallback
    await signInWithRedirect(auth, googleProvider);
    return;
  }
}

/**
 * Створює/повертає інстанс reCAPTCHA для phone auth.
 * @param {string} containerId - id DOM-елемента (напр. "recaptcha-container")
 * @param {"normal"|"invisible"} size - тип віджета
 */
export function setupPhoneRecaptcha(containerId = "recaptcha-container", size = "normal") {
  if (typeof window === "undefined") {
    throw new Error("reCAPTCHA може бути ініціалізована тільки в браузері");
  }

  // Пере-використовуємо існуючий інстанс між рендерами
  if (window._recaptchaVerifier) return window._recaptchaVerifier;

  window._recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size, // "normal" або "invisible"
    callback: () => {
      // викликається після успішної валідації
      // можна додати трекінг/лог
    },
    "expired-callback": () => {
      // токен протермінувався — користувачу треба повторити дію
    },
  });

  // Рендеримо віджет (для "normal")
  window._recaptchaVerifier.render().catch(() => {});
  return window._recaptchaVerifier;
}

/** Вхід через телефон (надсилає SMS і повертає ConfirmationResult) */
export function loginWithPhone(e164Phone, appVerifier) {
  // e164Phone типу "+48..." / "+380..."
  return signInWithPhoneNumber(auth, e164Phone, appVerifier);
}

export { auth };
