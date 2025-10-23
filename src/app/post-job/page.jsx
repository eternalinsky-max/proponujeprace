// src/app/post-job/page.jsx
export const dynamic = "force-dynamic";
export const revalidate = false;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import React, { Suspense } from "react";
import PostJobClient from "./PostJobClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-600">Ładowanie…</div>}>
      <PostJobClient />
    </Suspense>
  );
}
