// src/lib/firebase-client.js
import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";

// Конфіг з .env (NEXT_PUBLIC_*)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Singleton ініціалізація
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth + Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics — тільки в браузері й коли підтримується
export let analytics;
if (typeof window !== "undefined") {
  analyticsIsSupported()
    .then((ok) => { if (ok) analytics = getAnalytics(app); })
    .catch(() => {});
}
