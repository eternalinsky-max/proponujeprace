// src/lib/login-with-google.js
"use client";

import { auth, googleProvider } from "@/lib/firebase-client";
import { signInWithPopup, signInWithRedirect } from "firebase/auth";

export async function loginWithGoogle() {
  try {
    // Основний шлях — popup
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    // Fallback для середовищ, де попап блокується (COOP warnings, webview, Safari)
    if (typeof window !== "undefined") {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    throw err;
  }
}
