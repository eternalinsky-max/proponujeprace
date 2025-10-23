// src/app/my-jobs/page.jsx (Server Component wrapper)
export const dynamic = "force-dynamic";
export const revalidate = false;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import React, { Suspense } from "react";
import MyJobsClient from "./MyJobsClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <section className="px-4 py-6 sm:px-6">
          <h1 className="mb-4 text-xl font-bold">Moje oferty</h1>
          <div className="rounded-lg border bg-white p-6 text-gray-600">Ładowanie…</div>
        </section>
      }
    >
      <MyJobsClient />
    </Suspense>
  );
}
