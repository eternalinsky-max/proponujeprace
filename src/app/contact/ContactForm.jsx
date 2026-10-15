'use client';

import { useEffect, useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    termsAccepted: false,
  });
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const [startedAt, setStartedAt] = useState(Date.now());

  useEffect(() => setStartedAt(Date.now()), []);

  // 🧩 автоматичне приховування повідомлень
  useEffect(() => {
    if (ok || err) {
      const timer = setTimeout(() => {
        setOk(false);
        setErr('');
      }, 5000); // 5 секунд
      return () => clearTimeout(timer);
    }
  }, [ok, err]);

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setOk(false);
    setErr('');

    const hp = (e.currentTarget.website?.value || '').trim();

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          website: hp,
          startedAt,
          termsAccepted: form.termsAccepted,
        }),
      });

      // 🧩 обробка rate limit (429)
      if (res.status === 429) {
        const retry = res.headers.get('Retry-After');
        throw new Error(
          retry
            ? `Zbyt wiele prób. Spróbuj ponownie za ${retry} s.`
            : 'Zbyt wiele prób. Spróbuj ponownie później.',
        );
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok !== true) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setOk(true);
      setForm({ name: '', email: '', message: '', termsAccepted: false });
      setStartedAt(Date.now());
    } catch (e2) {
      setErr(e2.message || 'Wystąpił błąd');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-gray-700">
      <h1 className="mb-6 text-center text-3xl font-bold">Skontaktuj się z nami</h1>

      <p className="mb-8 text-center text-gray-600">
        Jeśli masz pytania, sugestie lub chcesz zgłosić problem z portalem – napisz do nas.
        Odpowiemy najszybciej jak to możliwe.
      </p>

      {ok && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 transition-opacity">
          Dziękujemy! Wiadomość została wysłana.
        </div>
      )}
      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 transition-opacity">
          Błąd: {err}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Imię i nazwisko</label>
          <input
            type="text"
            name="name"
            required
            minLength={2}
            maxLength={100}
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500"
            placeholder="Twoje imię i nazwisko"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Adres e-mail</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500"
            placeholder="np. jan.kowalski@gmail.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Treść wiadomości</label>
          <textarea
            name="message"
            required
            rows={6}
            minLength={10}
            maxLength={5000}
            value={form.message}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500"
            placeholder="Napisz swoją wiadomość..."
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={form.termsAccepted}
            onChange={handleChange}
            required
          />
          <label htmlFor="termsAccepted" className="text-gray-600">
            Wyrażam zgodę na kontakt w sprawie mojego zapytania.
          </label>
        </div>

        {/* honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <button
          type="submit"
          disabled={sending}
          className="btn btn-primary w-full transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {sending ? 'Wysyłanie…' : 'Wyślij wiadomość'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Lub napisz bezpośrednio:{' '}
        <a
          href="mailto:serwisvans@gmail.com"
          className="font-medium text-brand-600 hover:underline"
        >
          serwisvans@gmail.com
        </a>
      </p>

      <section className="mt-8 rounded-2xl border bg-gray-50 p-6 text-[10px] leading-relaxed text-gray-700 shadow-inner">
        <p>
          <strong>SERWIS TECHNICZNY VOLODYMYR STUPACHENKO</strong>
        </p>
        <p>NIP: 5272878587</p>
        <p>REGON: 541980784</p>
        <p>Tel.: +48739540623 </p>
        <p>Adres: UL. STANISŁAWA WOJCIECHOWSKIEGO 33 / 7, 02-495 WARSZAWA</p>
      </section>
      {/* MAPA — Google Maps embed */}
      <div className="mt-4 overflow-hidden rounded-2xl border">
        <iframe
          title="Mapa — SERWIS TECHNICZNY"
          src={
            'https://www.google.com/maps?q=' +
            encodeURIComponent('UL. STANISŁAWA WOJCIECHOWSKIEGO 33, 02-495 WARSZAWA') +
            '&output=embed'
          }
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-64 w-full"
        />
      </div>
    </main>
  );
}
