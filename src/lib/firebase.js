// src/lib/firebase.js
'use client';

import { signInWithPopup, signInWithRedirect } from 'firebase/auth';

import { auth, googleProvider } from './firebase-client';

/** Logowanie Google z fallbackiem na redirect (Safari/WebView itp.) */
export async function loginWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    // якщо popup заблоковано
    await signInWithRedirect(auth, googleProvider);
    return;
  }
}

export { auth };
