// src/lib/auth.js
import "server-only";
import * as admin from "firebase-admin";

const GLOBAL_KEY = "__FIREBASE_ADMIN_APP__";

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is missing");

  let conf = JSON.parse(raw);
  // виправляємо перенос рядків у приватному ключі
  if (conf.private_key?.includes("\\n")) {
    conf.private_key = conf.private_key.replace(/\\n/g, "\n");
  }

  // деякі ключі можуть мати інші імена полів; нормалізуємо
  return {
    projectId: conf.project_id,
    clientEmail: conf.client_email,
    privateKey: conf.private_key,
  };
}

function initAdmin() {
  if (globalThis[GLOBAL_KEY]) return globalThis[GLOBAL_KEY];

  const { projectId, clientEmail, privateKey } = getServiceAccount();

  const app =
    admin.apps.length > 0
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          // за потреби додай: storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });

  globalThis[GLOBAL_KEY] = app;
  return app;
}

const adminApp = initAdmin();
const adminAuth = admin.auth(adminApp);

/**
 * Перевіряє Firebase ID токен.
 * Повертає DecodedIdToken або null (у разі невалідного/відкликаного токена).
 *
 * @param {string} idToken
 * @param {{ checkRevoked?: boolean }} [opts]
 * @returns {Promise<import('firebase-admin').auth.DecodedIdToken|null>}
 */
export async function verifyFirebaseToken(
  idToken,
  { checkRevoked = false } = {},
) {
  try {
    if (!idToken) return null;
    const decoded = await adminAuth.verifyIdToken(idToken, checkRevoked);
    return decoded;
  } catch {
    return null;
  }
}

// (опційно корисно мати під рукою)
export { adminApp, adminAuth };
