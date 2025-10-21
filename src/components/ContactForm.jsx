"use client";

import { useEffect, useState } from "react";

export default function ContactForm({ className = "" }) {
  const [startedAt, setStartedAt] = useState(Date.now());
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => setStartedAt(Date.now()), []);

  async function onSubmit(e) {
    e.preventDefault();
    setSending(true);
    setOk(false);
    setErr("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
      website: fd.get("website"),              // honeypot (hidden)
      startedAt,                               // time trap
      termsAccepted: fd.get("terms") === "on", // checkbox
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok !== true) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setOk(true);
      e.currentTarget.reset();
      setStartedAt(Date.now()); // нова сесія форми
    } catch (e) {
      setErr(e.message || "Wystąpił błąd");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={`grid gap-3 ${className}`}>
      {ok && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Dziękujemy! Wiadomość została wysłana.
        </div>
      )}
      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Błąd: {err}
        </div>
      )}

      <div className="grid gap-1.5">
        <label className="text-sm">Imię i nazwisko</label>
        <input
          name="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="Jan Kowalski"
          className="rounded-lg border px-3 py-2"
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="jan@example.com"
          className="rounded-lg border px-3 py-2"
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm">Wiadomość</label>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="Opisz krótko swój temat…"
          className="rounded-lg border px-3 py-2"
        />
      </div>

      {/* honeypot — nie wypełniać (ukryte dla ludzi) */}
      <div aria-hidden="true" className="hidden">
        <label>Website</label>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="terms" required />
        Wyrażam zgodę na kontakt w sprawie mojego zapytania.
      </label>

      <button
        type="submit"
        disabled={sending}
        className="btn btn-primary"
      >
        {sending ? "Wysyłanie…" : "Wyślij wiadomość"}
      </button>
    </form>
  );
}
