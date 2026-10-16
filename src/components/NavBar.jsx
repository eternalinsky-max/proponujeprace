'use client';
/* eslint-env browser */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

import AddJobButton from '@/components/AddJobButton';
import UserMenu from '@/components/UserMenu';

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const items = useMemo(
    () => [
      { href: '/', label: 'Strona główna' },
      { href: '/jobs', label: 'Oferty pracy' },
      { href: '/contact', label: 'Kontakt' },
      { href: '/news', label: 'Aktualności' },
    ],
    [],
  );

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  const linkClass = (active) =>
    `px-3 py-1.5 rounded-lg text-sm font-semibold tracking-wide transition-colors ${
      active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-4">
        
        {/* logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/favicon.svg"
            alt="wprace.pl"
            width={36}
            height={36}
            priority
            className="rounded-xl"
            unoptimized
          />
          <span className="font-bold">wprace.pl</span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Główna nawigacja">
          {items.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkClass(isActive(href))}
              aria-current={isActive(href) ? 'page' : undefined}
              prefetch
            >
              {label}
            </Link>
          ))}
          <AddJobButton />
          <UserMenu />
        </nav>

        {/* burger */}
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg border hover:bg-gray-50 md:hidden"
          aria-label="Otwórz menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* mobile panel */}
      {open && (
        <div className="border-t bg-white md:hidden" id="mobile-nav">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3" aria-label="Menu mobilne">
            {items.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={linkClass(isActive(href))}
                onClick={() => setOpen(false)}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
            <AddJobButton className="btn btn-primary mt-2 w-full justify-center" />
            <div className="mt-2">
              <UserMenu mobile onAction={() => setOpen(false)} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}