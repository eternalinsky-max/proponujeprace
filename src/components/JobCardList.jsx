// src/components/JobCardList.jsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback,useEffect, useMemo, useState } from 'react';

import JobCard from '@/components/JobCard';

export default function JobCardList({ jobs = [], defaultView = 'list' }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1) Початковий стан з URL або дефолт
  const initialView = useMemo(() => {
    const v = (searchParams.get('view') || '').toLowerCase();
    return v === 'grid' ? 'grid' : defaultView === 'grid' ? 'grid' : 'list';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, defaultView]);

  const [view, setView] = useState(initialView);

  // 2) Синхронізувати стан при зміні URL
  useEffect(() => {
    if (initialView !== view) setView(initialView);
  }, [initialView, view]);

  // 3) Оновлення URL без повного перезавантаження
  const updateUrl = useCallback(
    (nextView) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextView === 'list') params.delete('view'); // список — дефолт
      else params.set('view', 'grid');

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // 4) Перемикач виду
  const changeView = useCallback(
    (next) => {
      if (next === view) return;
      setView(next);
      updateUrl(next);
    },
    [updateUrl, view],
  );

  // 5) Порожній стан
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 text-gray-600" role="status" aria-live="polite">
        Brak ofert do wyświetlenia.
      </div>
    );
  }

  return (
    <div>
      {/* Перемикач виду */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => changeView('list')}
          className={`rounded-lg border px-3 py-1.5 text-sm transition ${
            view === 'list'
              ? 'border-brand-200 bg-brand-50 text-brand-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
          aria-pressed={view === 'list'}
        >
          Lista
        </button>
        <button
          type="button"
          onClick={() => changeView('grid')}
          className={`rounded-lg border px-3 py-1.5 text-sm transition ${
            view === 'grid'
              ? 'border-brand-200 bg-brand-50 text-brand-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
          aria-pressed={view === 'grid'}
        >
          Mozaika
        </button>
      </div>

      {/* Контейнер списку/сітки */}
      <div
        className={
          view === 'grid'
            ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' // сітка (2-3 колонки)
            : 'flex flex-col gap-4' // список — одна під одною
        }
      >
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
