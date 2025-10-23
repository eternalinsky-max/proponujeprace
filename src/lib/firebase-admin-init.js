import { getApps, initializeApp, cert } from "firebase-admin/app";

export function initFirebaseAdmin() {
  if (getApps().length) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON");
  }

  const svc = JSON.parse(raw);
  // якщо у ключі приватному збережені \\n, можна розкоментувати:
  if (typeof svc.private_key === "string" && svc.private_key.includes("\\n")) {
    svc.private_key = svc.private_key.replace(/\\n/g, "\n");
  }

  initializeApp({ credential: cert(svc) });
}
