import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white py-6 text-center text-sm text-gray-600">
      <p>
        Masz problem z portalem?{" "}
        <a
          href="mailto:serwisvans@gmail.com"
          className="text-brand-600 hover:underline font-medium"
        >
          serwisvans@gmail.com
        </a>
      </p>

      <div className="mt-2 flex justify-center gap-4 text-gray-500">
        <Link
          href="/privacy"
          className="hover:text-brand-600 hover:underline transition-colors"
        >
          Polityka prywatności
        </Link>
        <Link
          href="/terms"
          className="hover:text-brand-600 hover:underline transition-colors"
        >
          Regulamin
        </Link>
      </div>

      <p className="mt-2 text-gray-400">
        © {new Date().getFullYear()} proponujeprace.pl – Wszystkie prawa zastrzeżone
      </p>
    </footer>
  );
}
