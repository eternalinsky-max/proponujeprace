export const metadata = {
  title: "Polityka prywatności | proponujeprace.pl",
  description:
    "Dowiedz się, jak portal proponujeprace.pl chroni Twoje dane osobowe i prywatność.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-gray-700">
      <h1 className="text-3xl font-bold mb-6">Polityka prywatności</h1>

      <p className="mb-4">
        Niniejsza polityka prywatności opisuje zasady przetwarzania danych
        osobowych użytkowników portalu <strong>proponujeprace.pl</strong>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Administrator danych</h2>
      <p>
        Administratorem danych osobowych jest właściciel portalu, kontakt:
        <a
          href="mailto:serwisvans@gmail.com"
          className="text-brand-600 hover:underline ml-1"
        >
          serwisvans@gmail.com
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. Zakres przetwarzania danych</h2>
      <p>
        Dane użytkowników (adres e-mail, imię, identyfikator konta Google lub numer
        telefonu) są przetwarzane wyłącznie w celu umożliwienia logowania i
        korzystania z funkcji portalu.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Pliki cookies</h2>
      <p>
        Portal wykorzystuje pliki cookies w celu poprawnego działania, analizy
        ruchu oraz zapamiętywania preferencji użytkowników.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Kontakt</h2>
      <p>
        W sprawach związanych z ochroną danych osobowych możesz skontaktować się
        z nami pod adresem:
        <a
          href="mailto:serwisvans@gmail.com"
          className="text-brand-600 hover:underline ml-1"
        >
          serwisvans@gmail.com
        </a>
        .
      </p>
    </main>
  );
}
