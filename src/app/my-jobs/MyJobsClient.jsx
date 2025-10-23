// src/app/my-jobs/MyJobsClient.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import JobCardList from "@/components/JobCardList";
import Pagination from "@/components/Pagination";
import { useAuthUser } from "@/lib/useAuthUser";
import { auth } from "@/lib/firebase";

const PER_PAGE_OPTIONS = [10, 20, 50];
const STATUS_OPTIONS = [
  { value: "", label: "Wszystkie" },
  { value: "ACTIVE", label: "Aktywne" },
  { value: "HIDDEN", label: "Ukryte" },
  { value: "DRAFT", label: "Szkic" },
];

export default function MyJobsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuthUser();

  const page = Math.max(Number(searchParams.get("page") || "1"), 1);
  const perPage = useMemo(() => {
    const val = Number(searchParams.get("perPage") || PER_PAGE_OPTIONS[0]);
    return PER_PAGE_OPTIONS.includes(val) ? val : PER_PAGE_OPTIONS[0];
  }, [searchParams]);
  const status = (searchParams.get("status") || "").trim();
  const city = (searchParams.get("city") || "").trim();
  const remote = searchParams.get("remote"); // "1" | "0" | null

  const [state, setState] = useState({ items: [], total: null, totalPages: 1, hasNext: false });
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const setQuery = (obj) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(obj).forEach(([k, v]) => {
      if (v == null || v === "") params.delete(k);
      else params.set(k, String(v));
    });
    router.push(`/my-jobs?${params.toString()}`);
  };

  const setPage = (next) => setQuery({ page: next, perPage, status, city, remote });
  const setPerPage = (next) => setQuery({ page: 1, perPage: next, status, city, remote });
  const setStatus = (next) => setQuery({ page: 1, perPage, status: next, city, remote });
  const setCity = (next) => setQuery({ page: 1, perPage, status, city: next, remote });
  const setRemote = (next) => setQuery({ page: 1, perPage, status, city, remote: next });

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (loading) return;
      if (!user) {
        router.replace(`/login?next=/my-jobs`);
        return;
      }
      try {
        setFetching(true);
        setError("");

        const token = await auth.currentUser?.getIdToken(true);
        if (!token) {
          router.replace(`/login?next=/my-jobs`);
          return;
        }

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("perPage", String(perPage));
        if (status) params.set("status", status);
        if (city) params.set("city", city);
        if (remote === "1" || remote === "0") params.set("remote", remote);

        const res = await fetch(`/api/my-jobs?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const normalized = {
          items: data.items ?? [],
          total: data.total ?? null,
          totalPages: data.totalPages ?? (data.hasNext ? page + 1 : page),
          hasNext: !!data.hasNext,
        };

        if (!aborted) setState(normalized);
      } catch (e) {
        console.error(e);
        if (!aborted) setError(e.message || "Błąd pobierania");
      } finally {
        if (!aborted) setFetching(false);
      }
    }
    run();
    return () => { aborted = true; };
  }, [user, loading, page, perPage, status, city, remote, router, searchParams]);

  if (loading || fetching) {
    return (
      <section className="px-4 py-6 sm:px-6">
        <h1 className="mb-4 text-xl font-bold">Moje oferty</h1>
        <div className="rounded-lg border bg-white p-6 text-gray-600">Ładowanie…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-6 sm:px-6">
        <h1 className="mb-4 text-xl font-bold">Moje oferty</h1>
        <div className="rounded-lg border bg-white p-6 text-red-600">Błąd: {error}</div>
      </section>
    );
  }

  const hasItems = (state.items?.length ?? 0) > 0;

  return (
    <section className="px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Moje oferty</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span>Na stronę:</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="rounded-lg border px-2 py-1 text-sm"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>

          <Link href="/post-job" className="btn btn-primary">Dodaj ofertę</Link>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="w-20 shrink-0 text-gray-600">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border px-2 py-1.5 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <span className="w-20 shrink-0 text-gray-600">Miasto</span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="np. Warszawa"
            className="w-full rounded-lg border px-2 py-1.5 text-sm"
          />
        </label>

        <div className="flex items-center gap-3 text-sm">
          <span className="w-20 shrink-0 text-gray-600">Tryb</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setRemote(null)}
              className={`rounded-lg border px-2 py-1.5 ${remote == null ? "bg-brand-50 border-brand-600" : ""}`}>
              Wszystkie
            </button>
            <button type="button" onClick={() => setRemote("1")}
              className={`rounded-lg border px-2 py-1.5 ${remote === "1" ? "bg-brand-50 border-brand-600" : ""}`}>
              Zdalnie
            </button>
            <button type="button" onClick={() => setRemote("0")}
              className={`rounded-lg border px-2 py-1.5 ${remote === "0" ? "bg-brand-50 border-brand-600" : ""}`}>
              Stacjonarnie
            </button>
          </div>
        </div>
      </div>

      {hasItems ? (
        <>
          <JobCardList jobs={state.items} />
          <div className="mt-6">
            <Pagination page={page} totalPages={state.totalPages} onPageChange={setPage} />
          </div>
          <div className="mt-3 text-center text-sm text-gray-600">
            {state.total != null ? <>Razem: <span className="font-semibold">{state.total}</span></> : <>Ładowanie łącznej liczby może być pominięte dla szybkości.</>}
          </div>
        </>
      ) : (
        <div className="rounded-lg border bg-white p-6 text-gray-600">Nie masz jeszcze żadnych ofert.</div>
      )}
    </section>
  );
}
