export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { initFirebaseAdmin } from "@/lib/firebase-admin-init";
// import { getAuth } from "firebase-admin/auth"; // якщо треба

export async function POST(_req, { params }) {
  try {
    // 1) Ініт — тільки тут, не на верхньому рівні модуля
    initFirebaseAdmin();

    const { id } = params;

    // 2) твоя логіка відновлення логу...
    // приклад:
    // const user = await getAuth().verifyIdToken(...)

    return NextResponse.json({ ok: true, restoredId: id });
  } catch (e) {
    const msg = e?.message || "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
