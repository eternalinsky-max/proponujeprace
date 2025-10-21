"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  loginWithGoogle,
  auth,
  setupPhoneRecaptcha,
  loginWithPhone,
} from "@/lib/firebase";

/** Проста нормалізація телефону до формату E.164 (мінімальна перевірка) */
function toE164(input) {
  const s = String(input || "").replace(/[()\s-]/g, "");
  if (!s.startsWith("+")) return null; // очікуємо +48..., +380..., тощо
  // Мінімум + і ще 6 цифр (реальні перевірки можна зробити libphonenumber)
  if (!/^\+\d{6,15}$/.test(s)) return null;
  return s;
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState(null);

  const [me, setMe] = useState(null);
  const [err, setErr] = useState(null);

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingSms, setLoadingSms] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);

  const phoneE164 = useMemo(() => toE164(phone), [phone]);
  const canSendSms = !!phoneE164 && !loadingSms && !confirm;
  const canConfirm = !!confirm && code.trim().length >= 4 && !loadingCode;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        localStorage.removeItem("idToken");
        setMe(null);
        return;
      }
      try {
        const token = await user.getIdToken();
        localStorage.setItem("idToken", token);
        const r = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
        setMe(data);
        setErr(null);
      } catch (e) {
        setErr(e.message);
      }
    });
    return () => unsub();
  }, []);

  async function handleGoogle() {
    try {
      setErr(null);
      setLoadingGoogle(true);
      await loginWithGoogle();
    } catch (e) {
      setErr(e.message || "Logowanie przez Google nie powiodło się");
    } finally {
      setLoadingGoogle(false);
    }
  }

  async function handleSendSms() {
    try {
      setErr(null);
      if (!phoneE164) {
        setErr("Podaj poprawny numer w formacie +48… / +380…");
        return;
      }
      setLoadingSms(true);

      // Ініціалізуємо/пере-використаємо reCAPTCHA
      const verifier = setupPhoneRecaptcha("recaptcha-container");

      const c = await loginWithPhone(phoneE164, verifier);
      setConfirm(c);
    } catch (e) {
      // Найчастіші хиби: missing config для reCAPTCHA, блокування домену, rate limit у Firebase
      setErr(e.message || "Nie udało się wysłać SMS");
    } finally {
      setLoadingSms(false);
    }
  }

  async function handleConfirmCode() {
    try {
      setErr(null);
      if (!confirm) {
        setErr("Najpierw wyślij kod SMS.");
        return;
      }
      if (!code.trim()) {
        setErr("Wpisz kod z SMS.");
        return;
      }
      setLoadingCode(true);
      await confirm.confirm(code.trim());
      // onAuthStateChanged вище зробить решту
    } catch (e) {
      setErr(e.message || "Kod nieprawidłowy");
    } finally {
      setLoadingCode(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">Zaloguj się</h1>

      <div className="space-y-4 rounded-xl border bg-white p-6 shadow-soft">
        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loadingGoogle}
          className="btn btn-primary w-full justify-center"
        >
          {loadingGoogle ? "Logowanie…" : "Zaloguj przez Google"}
        </button>

        <div className="border-t pt-4">
          {/* Контейнер для reCAPTCHA */}
          <div id="recaptcha-container" />

          {/* Телефон */}
          <div className="mt-3 flex gap-2">
            <input
              placeholder="+48 600700800"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              inputMode="tel"
              autoComplete="tel"
            />
            <button
              onClick={handleSendSms}
              disabled={!canSendSms}
              className="btn btn-ghost"
              title={!phoneE164 ? "Podaj numer w formacie +48…" : undefined}
            >
              {loadingSms ? "Wysyłanie…" : "Wyślij SMS"}
            </button>
          </div>

          {/* Код з SMS */}
          {confirm && (
            <div className="mt-3 flex gap-2">
              <input
                placeholder="Kod z SMS"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <button
                onClick={handleConfirmCode}
                disabled={!canConfirm}
                className="btn btn-primary"
              >
                {loadingCode ? "Potwierdzanie…" : "Zaloguj"}
              </button>
            </div>
          )}

          {err && (
            <p className="mt-2 text-sm text-red-600">
              {err}
            </p>
          )}
        </div>
      </div>

      {me && (
        <div className="rounded-xl border bg-white p-6 shadow-soft">
          <div>
            <b>Zalogowano jako:</b>{" "}
            {me.displayName || me.email || me.phone || "Użytkownik"}
          </div>
          <button onClick={() => signOut(auth)} className="btn btn-ghost mt-3">
            Wyloguj
          </button>
        </div>
      )}
    </section>
  );
}
