export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

// ---------- Prisma (singleton) ----------
const prisma = globalThis._prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis._prisma = prisma;

// ---------- Firebase Admin init (singleton) ----------
let adminInited = false;
async function initFirebaseAdmin() {
  if (adminInited) return;
  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");

  if (!getApps().length) {
    // Можна тримати або JSON, або base64, що зручно
    const svcJson =
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON ??
      (process.env.FIREBASE_SERVICE_ACCOUNT_B64
        ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf8")
        : null);

    if (!svcJson) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON (або *_B64) не заданий — бек не зможе верифікувати токен."
      );
    }

    initializeApp({
      credential: cert(JSON.parse(svcJson)),
    });
  }
  adminInited = true;
}

async function verifyBearer(req) {
  await initFirebaseAdmin();
  const { getAuth } = await import("firebase-admin/auth");
  const authz = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authz || !authz.toLowerCase().startsWith("bearer ")) {
    return { error: "Missing Bearer token", status: 401 };
  }
  const idToken = authz.slice(7).trim();
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return { uid: decoded.uid };
  } catch (e) {
    return { error: "Invalid token", status: 401, _meta: e?.message };
  }
}

// ---------- Zod: query schema ----------
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(10),
});

// ... решта коду вище без змін

export async function GET(req) {
  try {
    // 0) Швидкий чек env, щоб не ловити немий 500
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON && !process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
      return NextResponse.json(
        { error: "Missing Firebase Admin credentials (FIREBASE_SERVICE_ACCOUNT_JSON or *_B64)" },
        { status: 500 }
      );
    }

    // 1) Авторизація
    const authRes = await verifyBearer(req);
    if (authRes.error) {
      return NextResponse.json({ error: authRes.error, meta: authRes._meta }, { status: authRes.status });
    }

    // 2) Користувач у БД
    const me = await prisma.user.findUnique({
      where: { firebaseUid: authRes.uid },
      select: { id: true },
    });
    if (!me) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    // 3) Пагінація
    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      page: url.searchParams.get("page"),
      perPage: url.searchParams.get("perPage"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Bad query", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { page, perPage } = parsed.data;
    const skip = (page - 1) * perPage;

    // 4) Дані
    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where: { ownerId: me.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
        select: {
          id: true, title: true, city: true, isRemote: true,
          salaryMin: true, salaryMax: true, status: true,
          createdAt: true, updatedAt: true, companyId: true,
          Company: { select: { id: true, name: true, logoUrl: true } },
        },
      }),
      prisma.job.count({ where: { ownerId: me.id } }),
    ]);

    return NextResponse.json({
      ok: true,
      page, perPage, total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      items,
    });
  } catch (err) {
    console.error("GET /api/my-jobs error:", err);
    // у деві повернемо текст помилки для швидкого фіксу
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ error: err?.message || "Internal", stack: err?.stack }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
