"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Facebook,
  Instagram,
  Linkedin,
  Home,
  Leaf,
  Briefcase,
  Handshake,
  Hammer,
  Sunrise,
} from "lucide-react";
import { useMemo } from "react";

function hashString(s) {
  // простий детермінований хеш (без Math.random / Date.now)
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const pathname = usePathname() || "/";

  // 🧠 детермінований вибір іконки за шляхом
  const icons = [Home, Leaf, Briefcase, Handshake, Hammer, Sunrise];
  const Icon = useMemo(() => {
    const idx = hashString(pathname) % icons.length;
    return icons[idx];
  }, [pathname]);

  return (
    <footer className="mt-10 bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:flex sm:items-center sm:justify-between">
        <div className="text-sm">
          <p className="font-medium text-white">proponujeprace.pl</p>
          <p className="text-gray-400">© {year} Wszystkie prawa zastrzeżone</p>
        </div>

        <nav className="mt-4 flex flex-wrap items-center gap-4 text-sm sm:mt-0">
          <Link href="/terms" className="hover:text-white transition">Regulamin</Link>
          <Link href="/privacy" className="hover:text-white transition">Polityka prywatności</Link>
          <Link href="/contact" className="hover:text-white transition">Kontakt</Link>
        </nav>

        <div className="mt-4 flex items-center gap-4 sm:mt-0">
          <Link href="https://facebook.com" target="_blank" className="hover:text-blue-400 transition">
            <Facebook className="size-5" />
          </Link>
          <Link href="https://instagram.com" target="_blank" className="hover:text-pink-400 transition">
            <Instagram className="size-5" />
          </Link>
          <Link href="https://linkedin.com" target="_blank" className="hover:text-sky-400 transition">
            <Linkedin className="size-5" />
          </Link>
        </div>
      </div>

      {/* детермінований блок — без гідраційних розбіжностей */}
      <div
        className="border-t border-gray-700 text-center py-4 text-sm text-gray-400 italic flex justify-center items-center gap-2"
        suppressHydrationWarning
      >
        <Icon className="size-4 text-gray-500" />
        <span>
          „Cokolwiek czynicie, z duszy wykonujcie, jak dla Pana, a nie dla ludzi.” — Кол. 3:23
        </span>
      </div>
    </footer>
  );
}
