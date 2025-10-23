// src/app/post-job/page.jsx
"use client";

export const dynamic = "force-dynamic";
export const revalidate = false;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { withAuth } from "@/lib/withAuth";
import { auth } from "@/lib/firebase";

function PostJobPage({ user }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [loading, setLoading] = useState(false);

  async function getIdTokenSafe() {
    if (user && typeof user.getIdToken === "function") {
      return user.getIdToken(true);
    }
    if (auth?.currentUser) {
      return auth.currentUser.getIdToken(true);
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = await getIdTokenSafe();
    if (!token) {
      alert("Najpierw zaloguj się (Google lub telefon).");
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, city, salaryMin, salaryMax }),
      });

      if (res.ok) {
        alert("Oferta została dodana!");
        setTitle(""); setDescription(""); setCity(""); setSalaryMin(""); setSalaryMax("");
        router.push("/jobs");
      } else {
        let msg = `HTTP ${res.status}`;
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const data = await res.json();
            msg = data?.error || msg;
          } else {
            msg = (await res.text()) || msg;
          }
        } catch {}
        alert("Błąd: " + msg);
      }
    } catch (err) {
      console.error(err);
      alert("Błąd: sieć lub CORS");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-soft">
      <h1 className="mb-1 text-2xl font-bold">Dodaj ofertę</h1>
      <p className="mb-6 text-gray-600">
        Zalogowano jako: {user?.email || user?.displayName || "użytkownik"}
      </p>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          className="input"
          placeholder="Tytuł oferty"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="input"
          rows={5}
          placeholder="Opis oferty"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="input"
          placeholder="Miasto (opcjonalnie)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="Minimalne wynagrodzenie"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            inputMode="numeric"
          />
          <input
            className="input"
            placeholder="Maksymalne wynagrodzenie"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
          {loading ? "Dodawanie…" : "Dodaj ofertę"}
        </button>
      </form>

      <style jsx global>{`
        .input {
          @apply w-full border rounded-lg px-3 py-2 text-sm shadow-sm
                 focus:ring-2 focus:ring-brand-500 focus:outline-none;
        }
      `}</style>
    </section>
  );
}

const AuthedPostJob = withAuth(PostJobPage, {
  onUnauthorized(router, nextUrl) {
    router.replace(`/login?next=${encodeURIComponent(nextUrl)}`);
  },
  loadingFallback: (
    <div className="p-6 text-center text-gray-600">Sprawdzanie uprawnień…</div>
  ),
});

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-600">Ładowanie…</div>}>
      <AuthedPostJob />
    </Suspense>
  );
}
