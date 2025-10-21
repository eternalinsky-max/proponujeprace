export const metadata = {
  title: "Regulamin | proponujeprace.pl",
  description:
    "Zapoznaj się z zasadami korzystania z portalu proponujeprace.pl.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-gray-700">
      <h1 className="text-3xl font-bold mb-6">Regulamin portalu proponujeprace.pl</h1>

      <p className="mb-4">
        Korzystając z portalu <strong>proponujeprace.pl</strong>, użytkownik akceptuje
        poniższe zasady.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Cel serwisu</h2>
      <p>
        Portal umożliwia dodawanie, przeglądanie i ocenianie ofert pracy w Polsce,
        a także wystawianie opinii o pracodawcach i pracownikach.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. Rejestracja</h2>
      <p>
        Użytkownicy mogą logować się przez konto Google lub numer telefonu. Dane są
        przetwarzane wyłącznie w celu umożliwienia korzystania z serwisu.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Odpowiedzialność</h2>
      <p>
        Administrator nie ponosi odpowiedzialności za treści dodane przez
        użytkowników, jednak zastrzega sobie prawo do ich moderacji lub usunięcia
        w przypadku naruszenia zasad.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Kontakt</h2>
      <p>
        W sprawach dotyczących działania serwisu prosimy o kontakt:
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
