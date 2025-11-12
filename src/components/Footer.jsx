import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white py-6 text-center text-sm text-gray-600">
      <p>
        Masz problem z portalem?{' '}
        <a
          href="mailto:serwisvans@gmail.com"
          className="font-medium text-brand-600 hover:underline"
        >
          serwisvans@gmail.com
        </a>
      </p>

      <div className="mt-2 flex justify-center gap-4 text-gray-500">
        <Link href="/privacy" className="transition-colors hover:text-brand-600 hover:underline">
          Polityka prywatności
        </Link>
        <Link href="/terms" className="transition-colors hover:text-brand-600 hover:underline">
          Regulamin
        </Link>
      </div>

      <p className="mt-2 text-gray-400">
        © {new Date().getFullYear()} proponujeprace.pl – Wszystkie prawa zastrzeżone
      </p>
    </footer>
  );
}
