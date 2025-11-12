// src/app/api/my-jobs/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const perRaw = Number(searchParams.get("perPage") || "10");
    const perPage = Math.min(50, Math.max(1, Number.isFinite(perRaw) ? perRaw : 10));

    const status = (searchParams.get("status") || "").trim();
    const city = (searchParams.get("city") || "").trim();
    const remote = searchParams.get("remote"); // "1" | "0" | null

    // ===== Перевірка токена =====
    const authHeader = req.headers.get("authorization") || "";
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    const idToken = m?.[1] || null;

    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const firebaseUid = decoded.uid;

    // ===== Гарантуємо існування користувача =====
    const me = await prisma.user.upsert({
      where: { firebaseUid },
      update: {},
      create: { id: firebaseUid, firebaseUid },
      select: { id: true },
    });

    // ===== Фільтри =====
    const where = { ownerId: me.id };
    if (status) where.status = status;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (remote === "1") where.isRemote = true;
    else if (remote === "0") where.isRemote = false;

    // ===== Вибірка =====
    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          title: true,
          description: true,
          city: true,
          isRemote: true,
          salaryMin: true,
          salaryMax: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          companyId: true,
          ownerId: true,
        },
      }),
      prisma.job.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const hasNext = page < totalPages;

    return NextResponse.json(
      { ok: true, items, page, perPage, total, totalPages, hasNext },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("[GET /api/my-jobs] error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
