"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import JobRatingBadge from "@/components/JobRatingBadge";
import Pagination from "@/components/Pagination";
import { auth } from "@/lib/firebase";
import { formatDescription } from "@/lib/formatDescription";

export default function MyJobsClient() {
  const [state, setState] = useState({
    items: [],
    total: 0,
    page: 1,
    perPage: 10,
    loading: true,
    error: null,
  });
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchMyJobs() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const token = await auth.currentUser?.getIdToken();
        const sp = new URLSearchParams();
        sp.set("page", String(state.page));
        sp.set("perPage", String(state.perPage));
        const res = await fetch(`/api/my-jobs?${sp.toString()}`, {
          signal: controller.signal,
          headers: { "x-id-token": token },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setState((prev) => ({
          ...prev,
          items: data.items ?? [],
          total: data.total ?? 0,
          page: data.page ?? prev.page,
          perPage: data.perPage ?? prev.perPage,
          loading: false,
          error: null,
        }));
        setSelected(new Set());
      } catch (err) {
        if (err.name === "AbortError") return;
        setState((prev) => ({ ...prev, loading: false, error: "Nie udało się załadować ofert." }));
      }
    }
    fetchMyJobs();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page, state.perPage]);

  // Вибір одного
  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Вибрати всі / зняти всі
  const toggleAll = () => {
    if (selected.size === state.items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(state.items.map((j) => j.id)));
    }
  };

  // Bulk дія
  const handleBulk = async (action) => {
    const ids = [...selected];
    if (ids.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Usunąć ${ids.length} ofert(y)?`)) return;
    }

    try {
      setBulkLoading(true);
      const token = await auth.currentUser?.getIdToken(true);
      const res = await fetch('/api/my-jobs/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids, action }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Оновлюємо локально
      if (action === 'delete') {
        setState((prev) => ({
          ...prev,
          items: prev.items.filter((j) => !ids.includes(j.id)),
          total: Math.max(0, prev.total - ids.length),
        }));
      } else {
        const newStatus = action === 'activate' ? 'ACTIVE' : 'INACTIVE';
        setState((prev) => ({
          ...prev,
          items: prev.items.map((j) =>
            ids.includes(j.id) ? { ...j, status: newStatus } : j
          ),
        }));
      }
      setSelected(new Set());
    } catch (e) {
      console.error('Bulk error:', e);
      alert('Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setBulkLoading(false);
    }
  };

  const allSelected = state.items.length > 0 && selected.size === state.items.length;
  const someSelected = selected.size > 0;

  return (
    <section className="px-4 py-6 sm:px-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Moje oferty</h1>
      </header>

      {state.loading && <p className="mb-3 text-sm text-gray-500">Ładowanie ofert…</p>}
      {state.error && <p className="mb-3 text-sm text-red-600">{state.error}</p>}

      {/* Панель bulk дій */}
      {someSelected && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm">
          <span className="text-blue-700 font-medium">Zaznaczono: {selected.size}</span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => handleBulk('activate')}
              disabled={bulkLoading}
              className="rounded-lg border border-green-200 px-3 py-1.5 text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              Aktywuj
            </button>
            <button
              onClick={() => handleBulk('deactivate')}
              disabled={bulkLoading}
              className="rounded-lg border border-yellow-200 px-3 py-1.5 text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
            >
              Dezaktywuj
            </button>
            <button
              onClick={() => handleBulk('delete')}
              disabled={bulkLoading}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Usuń
            </button>
          </div>
        </div>
      )}

      {/* Список оголошень */}
      {state.items.length === 0 && !state.loading ? (
        <p className="rounded-xl border border-dashed bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          Brak ofert do wyświetlenia.
        </p>
      ) : (
        <div className="grid gap-3">
          {/* Заголовок з "вибрати всі" */}
          {state.items.length > 0 && (
            <div className="flex items-center gap-3 px-1">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-gray-300 accent-blue-600"
              />
              <span className="text-sm text-gray-500">Zaznacz wszystkie</span>
            </div>
          )}

          {state.items.map((job) => {
            const isInactive = job.status === 'INACTIVE';
            const isChecked = selected.has(job.id);
            const safeDescription = formatDescription(job.description);

            return (
              <article
                key={job.id}
                onClick={() => toggleOne(job.id)}
                className={`cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-colors ${
                  isChecked ? 'border-blue-400 bg-blue-50' : 'hover:border-gray-300'
                } ${isInactive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Чекбокс */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOne(job.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 h-4 w-4 rounded border-gray-300 accent-blue-600"
                  />

                  <div className="flex-1">
                    <header className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold flex items-center gap-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline"
                          >
                            {job.title}
                          </Link>
                          {isInactive && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                              Nieaktywna
                            </span>
                          )}
                        </h2>
                        {job.city && (
                          <p className="text-sm text-gray-600">
                            {job.city} {job.isRemote ? '· praca zdalna' : null}
                          </p>
                        )}
                      </div>
                      <JobRatingBadge avg={job.ratingAvg} count={job.ratingCount} />
                    </header>

                    <div
                      className="line-clamp-2 text-sm text-gray-700"
                      dangerouslySetInnerHTML={{ __html: safeDescription }}
                    />

                    <footer className="mt-3 flex items-center gap-3">
                      <Link
                        href={`/jobs/${job.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-medium text-brand-600 hover:underline"
                      >
                        Szczegóły
                      </Link>
                      <Link
                        href={`/jobs/${job.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-gray-500 hover:underline"
                      >
                        Edytuj
                      </Link>
                    </footer>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {state.total > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={state.page}
            perPage={state.perPage}
            totalItems={state.total}
            onPageChange={(p) => setState((prev) => ({ ...prev, page: p }))}
            onPerPageChange={(p) => setState((prev) => ({ ...prev, perPage: p, page: 1 }))}
          />
        </div>
      )}
    </section>
  );
}